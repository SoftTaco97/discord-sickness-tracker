import { ChatInputCommandInteraction, PermissionsBitField, User } from 'discord.js';
import {
    getTallyCount,
    addTally,
    subtractTally,
    getAllTalliesForGuild,
    resetGuildTallies,
} from './db';

interface InteractionData {
    subcommand: string;
    guildId: string | null;
    requestUser: User;
    user:User;
}

/**
 * Helper function to gather common data from the interaction for command handlers
 */
const gatherInteractionData = (interaction: ChatInputCommandInteraction): InteractionData => {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guildId;
    const requestUser = interaction.options.getUser('user') ?? interaction.user;
    const user = interaction.user;

    return { subcommand, guildId, requestUser, user };
};

/**
 * Check if the user is a guild admin
 */
const isGuildAdmin = (interaction: ChatInputCommandInteraction): boolean => {
    if (!interaction.member) return false;
    const perms = interaction.member.permissions;

    if (typeof perms === 'string') {
        return (BigInt(perms) & PermissionsBitField.Flags.Administrator) === PermissionsBitField.Flags.Administrator;
    }

    return perms.has(PermissionsBitField.Flags.Administrator);
};

/**
 * Validate that the requester has permission to modify the target user's tallies
 * Returns true if allowed, false otherwise
 */
const canUserModify = (interaction: ChatInputCommandInteraction): boolean => {
    const { user, requestUser } = gatherInteractionData(interaction);
    const isSelf = requestUser.id === user.id;

    if (!isSelf && !isGuildAdmin(interaction)) {
        return false;
    }

    return true; // Permission granted
};

/**
 * Add a tally for a user
 */
const handleAdd = async (interaction: ChatInputCommandInteraction): Promise<void> => {
    const { guildId, requestUser } = gatherInteractionData(interaction);

    if (!canUserModify(interaction)) {
        await interaction.reply('You do not have permission to modify other user\'s tallies.');
        return;
    }

    if (!guildId) {
        await interaction.reply('This command can only be used in a server.');
        return;
    }

    const newTallyCount = addTally(guildId, requestUser.id);
    await interaction.reply(
        `Uh oh <@${requestUser.id}> is sick! Their tally increased to ${newTallyCount}.`
    );
};

/**
 * Remove a tally for a user
 */
const handleRemove = async (interaction: ChatInputCommandInteraction): Promise<void> => {
    const { guildId, requestUser } = gatherInteractionData(interaction);

    if (!canUserModify(interaction)) {
        await interaction.reply('You do not have permission to modify other user\'s tallies.');
        return;
    }

    if (!guildId) {
        await interaction.reply('This command can only be used in a server.');
        return;
    }

    const userId = requestUser.id;
    const currentTally = getTallyCount(guildId, userId);

    if (currentTally === 0) {
        await interaction.reply(`<@${requestUser.id}> has no tallies to remove.`);
        return;
    }

    const updatedTallyCount = subtractTally(guildId, userId);
    await interaction.reply(
        `Turns out <@${requestUser.id}> was not sick! Their tally decreased to ${updatedTallyCount}.`
    );
};

/**
 * Display scoreboard for the guild (public access)
 */
const handleScoreboard = async (interaction: ChatInputCommandInteraction): Promise<void> => {
    const { guildId } = gatherInteractionData(interaction);

    if (!guildId) {
        await interaction.reply('This command can only be used in a server.');
        return;
    }

    const talliesList = getAllTalliesForGuild(guildId);

    const scores =
        talliesList.map(({ user_id, tally_count }) => `<@${user_id}>: ${tally_count}`).join('\n') ||
        'No sickness tallies yet.';

    await interaction.reply(`**Scoreboard:**\n${scores}`);
};

/**
 * Reset all tallies for the guild (admin only)
 */
const handleReset = async (interaction: ChatInputCommandInteraction): Promise<void> => {
    const { guildId } = gatherInteractionData(interaction);

    if (!isGuildAdmin(interaction)) {
        await interaction.reply('Only admins can reset tallies. Nice try though.');
        return;
    }

    if (!guildId) {
        await interaction.reply('This command can only be used in a server.');
        return;
    }

    resetGuildTallies(guildId);
    await interaction.reply('All tallies reset.');
};

export { handleAdd, handleRemove, handleScoreboard, handleReset };
