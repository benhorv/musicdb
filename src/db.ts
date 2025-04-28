import sqlite3 from 'sqlite3';
const { Database } = sqlite3;
import { open } from 'sqlite';

export async function connectToDb() {
    return open({
        filename: './database/chinook.db',
        driver: Database,
    });
}

export async function getAllAlbums(db) {
    return db.all('SELECT * FROM albums');
}

export async function getAlbumById(db, id) {
    return db.get(`SELECT * FROM albums WHERE AlbumId = ?`, [id]);
}

export async function getAllArtists(db) {
    return db.all('SELECT * FROM artists');
}

export async function getArtistById(db, id) {
    return db.get(`SELECT * FROM artists WHERE ArtistId = ?`, [id]);
}

export async function getTrackById(db, id) {
    return db.get(`SELECT * FROM tracks WHERE TrackId = ?`, [id]);
}

export async function getAllAlbumsByArtistId(db, id) {
    return db.all(`SELECT * FROM albums WHERE ArtistId = ?`, [id]);
}

export async function getAllTracksByArtistId(db, id) {
    return db.all(`
        SELECT * FROM tracks
        WHERE tracks.AlbumId = (
            SELECT albums.AlbumId
            FROM
            tracks JOIN albums ON tracks.AlbumId = albums.AlbumId
            WHERE albums.ArtistId = ?
        )
        `, [id]);
}

export async function getAllTracksByAlbumId(db, id) {
    return db.all(`SELECT * FROM tracks WHERE AlbumId = ?`, [id]);
}

export async function getArtistByTrackId(db, id) {
    return db.get(`
        SELECT * FROM artists
        WHERE artists.ArtistId = (
            SELECT albums.ArtistId
            FROM
            tracks JOIN albums ON tracks.AlbumId = albums.AlbumId
            WHERE tracks.TrackId = ?
        )
        `, [id]);
}