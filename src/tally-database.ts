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

class TallyDatabase {
    static db: Database.Database;

    /**
     * Initialize the database connection and create tables if they don't exist
     * @returns {TallyDatabase} database instance
     */
    static initialize(guildId: string, userId: string): TallyDatabase {
        // First time initialization, create the database instance and schema
        if (!TallyDatabase.db) {
            const db = new Database(dbPath);
            // Enable foreign keys
            db.pragma('foreign_keys = ON');
            TallyDatabase.db = db;
        }

        const instance = new TallyDatabase(TallyDatabase.db, guildId, userId);
        return instance;
    }

    /**
     * Private constructor to enforce singleton pattern and ensure guild and user exist in the database
     * @param db database instance
     * @param guildId guild ID for the current context
     * @param userId user ID for the current context
     */
    private constructor(private db: Database.Database, private guildId: string, private userId: string) {
        this.ensureGuildExists();
        this.ensureUserExists();
    }
    
    /**
     * Initialize the database schema (create tables if they don't exist)
     */
    initializeSchema(): void {
        this.db.exec(`
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
    }

    /**
     * Add tally records for a user in a guild (inserts new records)
     */
    add(): number {
        // Add tally record
        const stmt = this.db.prepare('INSERT INTO tallies (guild_id, user_id) VALUES (?, ?)');
        stmt.run(this.guildId, this.userId);

        return this.getCount();
    }

    /**
     * Soft delete tally records for a user in a guild (mark as deleted without removing)
     */
    subtract(): number {
        // Soft delete tally records (mark as deleted without removing)
        const stmt = this.db.prepare(`
            UPDATE tallies 
            SET deleted = 1, updated_at = CURRENT_TIMESTAMP
            WHERE guild_id = ? AND user_id = ? AND deleted = 0
            LIMIT 1
        `);
        stmt.run(this.guildId, this.userId);

        return this.getCount();
    }

    /**
     * Get all tallies for a guild (counts non-deleted records per user)
     */
    getAllForGuild(): TallyResult[] {
        const stmt = this.db.prepare(`
            SELECT user_id, COUNT(*) as tally_count 
            FROM tallies 
            WHERE guild_id = ? AND deleted = 0
            GROUP BY user_id
            ORDER BY tally_count DESC
        `);

        return stmt.all(this.guildId) as TallyResult[];
    }

    /**
     * Get a user's tally count for a guild (counts non-deleted records)
     */
    getCount(): number {
        const stmt = this.db.prepare(
            'SELECT COUNT(*) as count FROM tallies WHERE guild_id = ? AND user_id = ? AND deleted = 0'
        );
        const result = stmt.get(this.guildId, this.userId) as CountResult | undefined;
        return result ? result.count : 0;
    }

    /**
     * Reset all tallies for a guild (soft delete - mark as deleted)
     */
    resetGuild(): void {
        const stmt = this.db.prepare(`
            UPDATE tallies 
            SET deleted = 1, updated_at = CURRENT_TIMESTAMP
            WHERE guild_id = ? AND deleted = 0
        `);
        stmt.run(this.guildId);
    }

    /** Private functions */

    /**
     * Ensure a guild exists in the database
     */
    private ensureGuildExists(): void {
        const stmt = this.db.prepare('INSERT OR IGNORE INTO guilds (guild_id) VALUES (?)');
        stmt.run(this.guildId);
    }

    /**
     * Ensure a user exists in the database
     */
    private ensureUserExists(): void {
        const stmt = this.db.prepare('INSERT OR IGNORE INTO users (user_id) VALUES (?)');
        stmt.run(this.userId);
    }
}

export default TallyDatabase;

