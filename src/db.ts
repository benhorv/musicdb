import { Database } from 'sqlite3';

export async function connectToDb() {
    const db = new Database("../database/chinook.db", (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log("Connected to database");
        }
    });
    return db;
}