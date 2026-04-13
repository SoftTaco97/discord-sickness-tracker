import Database from 'better-sqlite3';
import path from 'path';

interface TallyResult {
    user_id: string;
    tally_count: number;
}

interface CountResult {
    count: number;
}

const dbPath = path.resolve(__dirname, '../', 'data', 'tallies.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema
const initializeSchema = (): void => {
    db.exec(`
        CREATE TABLE IF NOT EXISTS guilds (
            guild_id TEXT PRIMARY KEY,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS tallies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            guild_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            deleted TINYINT(1) DEFAULT 0,
            FOREIGN KEY (guild_id) REFERENCES guilds(guild_id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_tallies_guild_user 
        ON tallies(guild_id, user_id);
    `);
};

initializeSchema();

// CRUD Functions

/**
 * Ensure a guild exists in the database
 */
const ensureGuildExists = (guildId: string): void => {
    const stmt = db.prepare('INSERT OR IGNORE INTO guilds (guild_id) VALUES (?)');
    stmt.run(guildId);
};

/**
 * Ensure a user exists in the database
 */
const ensureUserExists = (userId: string): void => {
    const stmt = db.prepare('INSERT OR IGNORE INTO users (user_id) VALUES (?)');
    stmt.run(userId);
};

/**
 * Get a user's tally count for a guild (counts non-deleted records)
 */
const getTallyCount = (guildId: string, userId: string): number => {
    const stmt = db.prepare(
        'SELECT COUNT(*) as count FROM tallies WHERE guild_id = ? AND user_id = ? AND deleted = 0'
    );
    const result = stmt.get(guildId, userId) as CountResult | undefined;
    return result ? result.count : 0;
};

/**
 * Add tally records for a user in a guild (inserts new records)
 */
const addTally = (guildId: string, userId: string): number => {
    ensureGuildExists(guildId);
    ensureUserExists(userId);

    // Add tally record
    const stmt = db.prepare('INSERT INTO tallies (guild_id, user_id) VALUES (?, ?)');
    stmt.run(guildId, userId);

    return getTallyCount(guildId, userId);
};

/**
 * Soft delete tally records for a user in a guild (mark as deleted without removing)
 */
const subtractTally = (guildId: string, userId: string): number => {
    // Soft delete tally records (mark as deleted without removing)
    const stmt = db.prepare(`
        UPDATE tallies 
        SET deleted = 1, updated_at = CURRENT_TIMESTAMP
        WHERE guild_id = ? AND user_id = ? AND deleted = 0
        LIMIT 1
    `);
    stmt.run(guildId, userId);

    return getTallyCount(guildId, userId);
};

/**
 * Get all tallies for a guild (counts non-deleted records per user)
 */
const getAllTalliesForGuild = (guildId: string): TallyResult[] => {
    const stmt = db.prepare(`
        SELECT user_id, COUNT(*) as tally_count 
        FROM tallies 
        WHERE guild_id = ? AND deleted = 0
        GROUP BY user_id
        ORDER BY tally_count DESC
    `);

    return stmt.all(guildId) as TallyResult[];
};

/**
 * Reset all tallies for a guild (soft delete - mark as deleted)
 */
const resetGuildTallies = (guildId: string): void => {
    const stmt = db.prepare(`
        UPDATE tallies 
        SET deleted = 1, updated_at = CURRENT_TIMESTAMP
        WHERE guild_id = ? AND deleted = 0
    `);
    stmt.run(guildId);
};

export {
    db,
    ensureGuildExists,
    ensureUserExists,
    getTallyCount,
    addTally,
    subtractTally,
    getAllTalliesForGuild,
    resetGuildTallies,
};
