    import * as database from './db.js';
    import fuzzysort from 'fuzzysort';

    export const resolvers = {
        Query: {
            albums: async (_, args: { title?: string }) => {
                try {
                    const db = await database.connectToDb();
                    const albums = await database.getAllAlbums(db);
                    if (args.title) {
                        const result = fuzzysort.go(args.title, albums, { key: 'Title' });

                        const filtered = result
                            .filter(r => r.score >= 0.9)
                            .map(r => r.obj);
                        
                        return filtered;
                    }
                    return albums;
                } catch (err) {
                    console.error('Error fetching albums: ', err);
                    throw new Error('Failed to fetch albums');
                }
            },
            album: async (_, args: { id: string }) => {
                try {
                    const db = await database.connectToDb();
                    return database.getAlbumById(db, args.id);
                } catch (err) {
                    console.error('Error fetching album: ', err);
                    throw new Error('Failed to fetch album');
                }
            },
            artists: async (_, args: { name?: string }) => {
                try {
                    const db = await database.connectToDb();
                    const artists = await database.getAllArtists(db);

                    if (args.name) {
                        const result = fuzzysort.go(args.name, artists, { key: 'Name' });

                        const filtered = result
                            .filter(r => r.score >= 0.9)
                            .map(r => r.obj);
                        
                        return filtered;
                    }
                    return artists;
                } catch (err) {
                    console.error('Error fetching artists: ', err);
                    throw new Error('Failed to fetch artists');
                }
            },
            artist: async (_, args: { id: string }) => {
                try {
                    const db = await database.connectToDb();
                    return database.getArtistById(db, args.id);
                } catch (err) {
                    console.error('Error fetching artist: ', err);
                    throw new Error('Failed to fetch artist');
                }
            },
            track: async (_, args: { id: string }) => {
                try {
                    const db = await database.connectToDb();
                    return database.getTrackById(db, args.id);
                } catch (err) {
                    console.error('Error fetching track: ', err);
                    throw new Error('Failed to fetch track');
                }
            },
        },
        Artist: {
            id: (artist) => artist.ArtistId,
            name: (artist) => artist.Name,
            albums: async (parent: any) => {
                try {
                    const db = await database.connectToDb();
                    return database.getAllAlbumsByArtistId(db, parent.ArtistId);
                } catch (err) {
                    console.error('Error fetching albums for artist: ', err);
                    throw new Error('Failed to fetch albums for artist');
                }
            },
            tracks: async (parent: any) => {
                try {
                    const db = await database.connectToDb();
                    return database.getAllTracksByArtistId(db, parent.ArtistId);
                } catch (err) {
                    console.error('Error fetching tracks for artist: ', err);
                    throw new Error('Failed to fetch tracks for artist');
                }
            }
        },
        Album: {
            id: (album) => album.AlbumId,
            title: (album) => album.Title,
            tracks: async (parent: any) => {
                try {
                    const db = await database.connectToDb();
                    return database.getAllTracksByAlbumId(db, parent.AlbumId);
                } catch (err) {
                    console.error('Error fetching tracks for album: ', err);
                    throw new Error('Failed to fetch tracks for album');
                }
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
                try {
                    const db = await database.connectToDb();
                    return database.getAlbumById(db, parent.AlbumId);
                } catch (err) {
                    console.error('Error fetching album for track: ', err);
                    throw new Error('Failed to fetch album for track');
                }
            },
            artist: async (parent: any) => {
                try {
                    const db = await database.connectToDb();
                    return database.getArtistByTrackId(db, parent.TrackId);
                } catch (err) {
                    console.error('Error fetching artist for track: ', err);
                    throw new Error('Failed to fetch artist for track');
                }
            }
        },
    };
