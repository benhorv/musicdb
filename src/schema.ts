const typeDefs = `#graphql

  type Album {
    id: ID!
    title: String!
  }

  type Artist {
    id: ID!
    name: String!
  }

  type Track {
    id: ID!
    name: String!
    composer: String!
    milliseconds: Int!
    bytes: Int!
    price: Float!
  }

  type Query {
    albums(title: String): [Album!]!
    album(id: ID!): Album
    artists(name: String): [Artist!]!
    artist(id: ID!): Artist
    track(id: ID!): Track
  }

`;