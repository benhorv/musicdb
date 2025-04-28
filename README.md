# musicdb

Manage and organize your music.

This application is created for the purpose of testing my development skills for a position.


## What can it do

The application manages data and relations in the given music database.
A standalone [Apollo](https://www.apollographql.com/) server runs under the hood, which [uses Express](https://www.apollographql.com/docs/apollo-server/api/standalone) in the background. The exposed endpoint for [GraphQL](https://graphql.org/) access is `/gql`.

## Data format

The following schema has been implemented:

- **Album**(id, title)
- **Artist**(id, name)
- **Track**(id, name, composer, milliseconds, bytes, price)

Implemented queries:

- albums(title: String): Returns albums with at least a 90% match based on the title.
- album(id: ID!): Retrieves a specific album by its ID.
- artists(name: String): Returns artists with at least a 90% match based on the name.
⁠- artist(id: ID!): Retrieves a specific artist by their ID.
- track(id: ID!): Retrieves a specific track by its ID.

FYI: The lookup based on match percentage is done with [fuzzysort](https://github.com/farzher/fuzzysort#readme).

## Usage

### Startup

Running the project requires `nodejs` and `npm`. 
The best way to install them is using `nvm`.

For further instructions have a look at the [official download page](https://nodejs.org/en/download).

#### Clone the repo:

`git clone git@github.com:benhorv/musicdb.git`

#### Step into the repo

`cd musicdb`

#### Install dependencies:

`npm install`

The command above installs all dependencies listed in `package.json`.

#### Download the database file

You have to download the database file from [here](https://www.sqlitetutorial.net/wp-content/uploads/2018/03/chinook.zip). Then create a database directory in the project root and copy it there. Be careful, the filename must be `chinook.db`.

##### On linux:

```bash
cd musicdb
mkdir database
cp path/to/chinook.db ./database/chinook.db
```

#### Run the server:

`npm start`

This starts the server on port 4000.

### Query

`npm start` starts a server on `http://localhost:4000/`. You can access the GraphQL endpoint at `http://localhost:4000/gql`.
The application can be tested straightaway at `http://localhost:4000/gql` in your browser, which opens the Apollo GraphQL sandbox UI.

#### Example queries

##### Returns all albums

```gql
query {
  albums {
    id
    title
  }
}
```

##### Returns all matching albums with name "Facelift"

```gql
query {
  albums(title: "Facelift") {
    id
    title
  }
}
```

##### Returns album with id 5

```gql
query {
  album(id: 5) {
    id
    title
  }
}
```

##### Returns all artists

```gql
query {
  artists {
    id
    name
  }
}
```

##### Returns all matching albums with name "AC/DC"

```gql
query {
  artists(name: "AC/DC") {
    id
    name
  }
}
```

##### Returns track with id 8

```gql
query {
  track(id: 8) {
    id
    name
    composer
    milliseconds
    bytes
    price
  }
}
```

##### Returns track with id 8, and also the associated album and artist

```gql
query {
  track(id: 8) {
    id
    name
    composer
    milliseconds
    bytes
    price
    artist {
      id
      name
    }
    album {
      id
      title
    }
  }
}
```

##### Returns album and the associated tracks

```gql
query {
  album(id: 6) {
    id
    title
    tracks {
      id
      name
      composer
      milliseconds
      bytes
      price
    }
  }
}
```

##### Returns artist with id 5 and associated albums and tracks

```gql
query {
  artist(id: 5) {
    id
    name
    albums {
      id
      title
    }
    tracks {
      id
      name
      composer
      milliseconds
      bytes
      price
    }
  }
}
```

## Run tests

[Vitest](https://vitest.dev/) is used for testing. I chose this because it works with TypeScript out of the box.

Run the tests with

`npm test`