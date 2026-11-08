import { ChatInputCommandInteraction, PermissionsBitField, User } from 'discord.js';
import { ERROR_MESSAGES, SCOREBOARD_MESSAGES, TALLY_ADDED_MESSAGES, TALLY_SUBTRACTED_MESSAGES, RESET_MESSAGES } from './config/messages';
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
            throw new Error(ERROR_MESSAGES.GuildOnlyCommand);
        }

        this.tallyDatabase = TallyDatabase.initialize(this.guildId, this.requestUserId);
    }

    /**
     * Add a tally for a user
     */
    async add(): Promise<void> {
        if (!this.canUserModify()) {
            await this.interaction.reply(ERROR_MESSAGES.MissingPermissions);
            return;
        }

        const newTallyCount = this.tallyDatabase.add();
        await this.interaction.reply(
            this.formatReplyFromList(
                TALLY_ADDED_MESSAGES.success, 
                this.requestUserId, 
                newTallyCount.toString()
            )
        );
    }

    /**
     * Remove a tally for a user
     */
    async remove(): Promise<void> {
        if (!this.canUserModify()) {
            await this.interaction.reply(ERROR_MESSAGES.MissingPermissions);
            return;
        }

        const currentTally = this.tallyDatabase.getCount();

        if (currentTally === 0) {
            await this.interaction.reply(
                this.formatReply(
                    TALLY_SUBTRACTED_MESSAGES.noTalliesToRemove, 
                    this.requestUserId
                )
            );
            return;
        }

        const updatedTallyCount = this.tallyDatabase.subtract();
        await this.interaction.reply(
            this.formatReplyFromList(
                TALLY_SUBTRACTED_MESSAGES.success, 
                this.requestUserId, 
                updatedTallyCount.toString()
            )
        );
    }

    /**
     * Display scoreboard for the guild (public access)
     */
    async scoreboard(): Promise<void> {
        if (!this.guildId) {
            await this.interaction.reply(ERROR_MESSAGES.GuildOnlyCommand);
            return;
        }

        const talliesList = this.tallyDatabase.getAllForGuild();

        const scores =
            talliesList
                .map(({ user_id, tally_count }) => this.formatReply(
                    SCOREBOARD_MESSAGES.scoreBoardEntry, 
                    user_id, 
                    tally_count.toString()
                )).join('\n') || SCOREBOARD_MESSAGES.noTallies;

        await this.interaction.reply(this.formatReply(
            SCOREBOARD_MESSAGES.scoreBoard, 
            scores
        ));
    }

    /**
     * Reset all tallies for the guild (admin only)
     */
    async reset(): Promise<void> {
        if (!this.isGuildAdmin()) {
            await this.interaction.reply(ERROR_MESSAGES.onlyAdminsCanReset);
            return;
        }

        await this.interaction.reply(RESET_MESSAGES.resetTallies);
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

    /**
     * Format a reply message by replacing placeholders with provided arguments
     * @param template string with placeholders (e.g., {1}, {2})
     * @param args array of arguments to replace placeholders in the template
     * @returns string with placeholders replaced by arguments
     */
    private formatReply(template: string, ...args: string[]): string {
        return template.replace(/{(\d+)}/g, (match, index) => {
            const argumentIndex = Number(index) - 1;
            return typeof args[argumentIndex] !== 'undefined' ? args[argumentIndex] : match;
        });
    }

    /**
     * Return a formatted reply message from a list of possible templates, replacing placeholders with provided arguments
     * @param templates list of string templates with placeholders (e.g., {1}, {2})
     * @param args array of arguments to replace placeholders in the selected template
     * @returns string with placeholders replaced by arguments
     */
    private formatReplyFromList(templates: string[], ...args: string[]): string {
        const template = templates[Math.floor(Math.random() * templates.length)];
        return this.formatReply(template, ...args);
    }
}

export default ActionHandler;
