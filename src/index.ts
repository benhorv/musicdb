import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';
import fs from 'fs';

const server = new ApolloServer({ typeDefs, resolvers });
try {
    const { url } = await startStandaloneServer(server, {
        listen: { port: 4000, path: '/gql' },
    });

    if (!fs.existsSync('./database/chinook.db')) {
        throw new Error('DB file not found at ./database/chinook.db');
    }
    console.log(`Server ready at ${url}`);
} catch (err) {
    console.error('Error starting server: ', err);
    process.exit(1);
}