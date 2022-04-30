const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const mogoose = require("mongoose");
const { Event } = require("./models/events");

const app = express();

app.use(express.json());
app.use(
  "/graphql",
  graphqlHTTP({
    schema: buildSchema(`
  
    type Event {
      _id: ID!
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }
    

    type RootQuery {
      events: [Event!]!
    }

    type RootMutation {
     createEvent(eventInput: EventInput): Event
    }

    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
    rootValue: {
      events: () => {
        const events = Event.find({})
          .then((events) => {
            console.log(events);
            return events;
          })
          .catch((err) => {
            console.log(err);
            throw Error;
          });
        return events;
      },
      createEvent: (args) => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: args.eventInput.price,
          date: new Date(args.eventInput.date),
        });
        return event
          .save()
          .then((result) => {
            console.log(result);
            return { ...result._doc };
          })
          .catch((err) => {
            console.log(err);
            throw Error;
          });
      },
    },
    graphiql: true,
  }),
);

mogoose
  .connect("mongodb://localhost:27017/event-booking")
  .then(console.log("connected to mongodDB"))
  .catch((err) => console.log(err));

app.listen(5000, () => {
  console.log("server running on port 6000...");
});
