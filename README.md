# Discord Sickness Tracker

A Discord bot for tracking sickness tallies in your server.

## Features

- **Add tallies** — Track sickness counts for users
- **Remove tallies** — Subtract from tallies when needed
- **View scoreboard** — See all tallies for your guild
- **Reset tallies** — Clear all tallies (admin only)
- **Permission-based commands** — Certain commands require admin privileges

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Discord bot token (from [Discord Developer Portal](https://discord.com/developers/applications))
- Client ID from your Discord application

## Installation

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd tally-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root:
   ```
   DISCORD_TOKEN=your_discord_bot_token
   CLIENT_ID=your_client_id
   ```

4. Build the project:
   ```bash
   npm run build
   ```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Available Scripts
- `npm run build` — Compile TypeScript to JavaScript
- `npm run clean` — Remove the dist directory
- `npm run lint` — Run ESLint
- `npm run format` — Format code with Prettier

## Commands

### `/sick add [user]`
Add a sickness tally to a user. If no user is specified, adds to yourself.

### `/sick remove [user]`
Remove a sickness tally from a user. If no user is specified, removes from yourself.

### `/sick scoreboard`
Display all sickness tallies for the current guild.

### `/sick reset`
Reset all sickness tallies for the guild. **Admin only.**

## Project Structure

```
src/
├── index.ts       — Bot initialization and command registration
├── actions.ts     — Command handlers
├── db.ts          — Database operations
data/              — SQLite database storage
```