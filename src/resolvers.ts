import { connectToDb } from './db';
import fuzzysort from 'fuzzysort';

export const resolvers = {
    Query: {
        albums: async (_, args: { title?: string }) => {
            const db = await connectToDb();
            const albums = await db.all('SELECT * FROM albums');

            if (args.title) {
                const result = fuzzysort.go(args.title, albums, { key: 'Title' });

                const filtered = result
                    .filter(r => r.score >= 0.9)
                    .map(r => r.obj);
                
                return filtered;
            }
            return albums;
        },
        album: (_, { id }) => {
            
        },
        artists: (_, { id }) => {
            
        },
        artist: (_, { id }) => {
            
        },
        track: (_, { id }) => {
            
        }
    },
    Album: {},
    Artist: {},
    Track: {},
};