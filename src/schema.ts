export const typeDefs = `#graphql

  type Album {
    id: ID!
    title: String!
    tracks: [Track!]!
  }

  type Artist {
    id: ID!
    name: String!
    albums: [Album!]!
  }

  type Track {
    id: ID!
    name: String!
    composer: String!
    milliseconds: Int!
    bytes: Int!
    price: Float!
    album: Album!
    artist: Artist! # relation via Album
  }

  type Query {
    albums(title: String): [Album!]!
    album(id: ID!): Album
    artists(name: String): [Artist!]!
    artist(id: ID!): Artist
    track(id: ID!): Track
  }

`;