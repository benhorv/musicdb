import { connectToDb } from './db.js';
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
            return db.get(`SELECT * FROM albums WHERE AlbumId = ?`, [args.id]);
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
            return db.get(`SELECT * FROM artists WHERE ArtistId = ?`, [args.id]);
        },
        track: async (_, args: { id: string }) => {
            const db = await connectToDb();
            return db.get(`SELECT * FROM tracks WHERE TrackId = ?`, [args.id]);
        },
    },
    Artist: {
        id: (artist) => artist.ArtistId,
        name: (artist) => artist.Name,
        albums: async (parent: any) => {
            const db = await connectToDb();
            return db.all(`SELECT * FROM albums WHERE ArtistId = ?`, [parent.id]);  
        }
    },
    Album: {
        id: (album) => album.AlbumId,
        title: (album) => album.Title,
        tracks: async (parent: any) => {
            const db = await connectToDb();
            return db.all(`SELECT * FROM tracks WHERE AlbumId = ?`, [parent.id]);  
        }
    },
    Track: {
        id: (track) => track.TrackId,
        name: (track) => track.Name,
        composer: (track) => track.Composer,
        milliseconds: (track) => track.Milliseconds,
        bytes: (track) => track.Bytes,
        price: (track) => track.UnitPrice,
        album: async (parent: any) => {
            const db = await connectToDb();
            return db.get(`SELECT * FROM albums WHERE AlbumId = ?`, [parent.AlbumId]);  
        },
        artist: async (parent: any) => {
            const db = await connectToDb();
            return db.get(`
                SELECT * FROM artists
                WHERE artists.ArtistId = (
                    SELECT albums.ArtistId
                    FROM
                    tracks JOIN albums ON tracks.AlbumId = albums.AlbumId
                    WHERE tracks.TrackId = ?
                )
                `, [parent.TrackId]);  
        }
    },
};