import { defaultDbPath, openDb, dbStats } from './db.js';

const dbPath = defaultDbPath();
const db = openDb(dbPath);
const stats = dbStats(db);
db.close();
console.log(`Initialized SQLite at ${dbPath}`);
console.log(JSON.stringify(stats, null, 2));
