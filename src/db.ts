import sqlite3 from 'sqlite3';
const { Database } = sqlite3;
import { open } from 'sqlite';

export async function connectToDb() {
    return open({
        filename: './database/chinook.db',
        driver: Database,
    });
}