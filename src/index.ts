import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';

const server = new ApolloServer({ typeDefs, resolvers });
try {
    const { url } = await startStandaloneServer(server, {
        listen: { port: 4000, path: '/gql' },
      });
    
    console.log(`Server ready at ${url}`);
} catch (err) {
    console.error('Error starting server: ', err);
    process.exit(1);
}