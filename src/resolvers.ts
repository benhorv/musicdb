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
        album: async (_, args: { id: string }) => {
            const db = await connectToDb();
            return db.get(`SELECT * FROM albums WHERE id = ${args.id}`);
        },
        artists: async (_, args: { name?: string }) => {
            const db = await connectToDb();
            const artists = await db.all('SELECT * FROM artists');

            if (args.name) {
                const result = fuzzysort.go(args.name, artists, { key: 'Name' });

                const filtered = result
                    .filter(r => r.score >= 0.9)
                    .map(r => r.obj);
                
                return filtered;
            }
            return artists;
        },
        artist: async (_, args: { id: string }) => {
            const db = await connectToDb();
            return db.get(`SELECT * FROM artists WHERE id = ${args.id}`);
        },
        track: async (_, args: { id: string }) => {
            const db = await connectToDb();
            return db.get(`SELECT * FROM tracks WHERE id = ${args.id}`);
        },
    },
    Artist: {
        albums: async (parent: any) => {
            const db = await connectToDb();
            return db.all(`SELECT * FROM albums WHERE id = ${parent.id}`);  
        }
    },
    Album: {
        tracks: async (parent: any) => {
            const db = await connectToDb();
            return db.all(`SELECT * FROM tracks WHERE id = ${parent.id}`);  
        }
    },
    Track: {
        albums: async (parent: any) => {
            const db = await connectToDb();
            return db.all(`SELECT * FROM albums WHERE id = ${parent.id}`);  
        },
        artists: async (parent: any) => {
            const db = await connectToDb();
            return db.all(`SELECT * FROM artists WHERE id = ${parent.id}`);  
        }
    },
};