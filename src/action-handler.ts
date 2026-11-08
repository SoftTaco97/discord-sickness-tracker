import { ChatInputCommandInteraction, PermissionsBitField, User } from 'discord.js';
import TallyDatabase from './tally-database';

class ActionHandler {
    private interaction: ChatInputCommandInteraction;
    private guildId: string | null;
    private requestUser: User;
    private requestUserId: string;
    private user: User;
    private tallyDatabase: TallyDatabase;

    constructor(interaction: ChatInputCommandInteraction) {
        this.interaction = interaction;
        this.guildId = interaction.guildId;
        this.requestUser = interaction.options.getUser('user') ?? interaction.user;
        this.requestUserId = this.requestUser.id;
        this.user = interaction.user;

        if (!this.guildId) {
            throw new Error('This command can only be used in a server.');
        }

        this.tallyDatabase = TallyDatabase.initialize(this.guildId, this.requestUserId);
    }

    /**
     * Add a tally for a user
     */
    async add(): Promise<void> {
        if (!this.canUserModify()) {
            await this.interaction.reply(
                "You do not have permission to modify other user's tallies."
            );
            return;
        }

        const newTallyCount = this.tallyDatabase.add();
        await this.interaction.reply(
            `Uh oh <@${this.requestUser.id}> is sick! Their tally increased to ${newTallyCount}.`
        );
    }

    /**
     * Remove a tally for a user
     */
    async remove(): Promise<void> {
        if (!this.canUserModify()) {
            await this.interaction.reply(
                "You do not have permission to modify other user's tallies."
            );
            return;
        }

        const currentTally = this.tallyDatabase.getCount();

        if (currentTally === 0) {
            await this.interaction.reply(`<@${this.requestUserId}> has no tallies to remove.`);
            return;
        }

        const updatedTallyCount = this.tallyDatabase.subtract();
        await this.interaction.reply(
            `Turns out <@${this.requestUserId}> was not sick! Their tally decreased to ${updatedTallyCount}.`
        );
    }

    /**
     * Display scoreboard for the guild (public access)
     */
    async scoreboard(): Promise<void> {
        if (!this.guildId) {
            await this.interaction.reply('This command can only be used in a server.');
            return;
        }

        const talliesList = this.tallyDatabase.getAllForGuild();

        const scores =
            talliesList
                .map(({ user_id, tally_count }) => `<@${user_id}>: ${tally_count}`)
                .join('\n') || 'No sickness tallies yet.';

        await this.interaction.reply(`**Scoreboard:**\n${scores}`);
    }

    /**
     * Reset all tallies for the guild (admin only)
     */
    async reset(): Promise<void> {
        if (!this.isGuildAdmin()) {
            await this.interaction.reply('Only admins can reset tallies. Nice try though.');
            return;
        }

        if (!this.guildId) {
            await this.interaction.reply('This command can only be used in a server.');
            return;
        }

        this.tallyDatabase.resetGuild();
        await this.interaction.reply('All tallies reset.');
    }

    /** Private functions */

    /**
     * Check if the user is a guild admin
     */
    private isGuildAdmin(): boolean {
        if (!this.interaction.member) return false;
        const perms = this.interaction.member.permissions;

        if (typeof perms === 'string') {
            return (
                (BigInt(perms) & PermissionsBitField.Flags.Administrator) ===
                PermissionsBitField.Flags.Administrator
            );
        }

        return perms.has(PermissionsBitField.Flags.Administrator);
    }

    /**
     * Validate that the requester has permission to modify the target user's tallies
     * Returns true if allowed, false otherwise
     */
    private canUserModify(): boolean {
        const isSelf = this.requestUserId === this.user.id;

        if (!isSelf && !this.isGuildAdmin()) {
            return false;
        }

        return true; // Permission granted
    }
}

export default ActionHandler;
