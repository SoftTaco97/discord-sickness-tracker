import { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, Interaction } from 'discord.js';
import dotenv from 'dotenv';
import { handleAdd, handleRemove, handleScoreboard, handleReset } from './actions';

dotenv.config();

interface ClientEnv {
    DISCORD_TOKEN: string;
    CLIENT_ID: string;
}

const getEnv = (): ClientEnv => {
    const token = process.env.DISCORD_TOKEN;
    const clientId = process.env.CLIENT_ID;

    if (!token || !clientId) {
        throw new Error('Missing required environment variables: DISCORD_TOKEN and CLIENT_ID');
    }

    return { DISCORD_TOKEN: token, CLIENT_ID: clientId };
};

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

const commands = [
    new SlashCommandBuilder()
        .setName('sick')
        .setDescription('Manage sickness tallies')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a sickness tally')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription(
                            'User to add sickness tally for (defaults to yourself if not specified)'
                        )
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a sickness tally')
                .addUserOption(option =>
                    option
                        .setName('user')
                        .setDescription(
                            'User to remove a sickness tally for (defaults to yourself if not specified)'
                        )
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand.setName('scoreboard').setDescription('Show current scoreboard')
        )
        .addSubcommand(subcommand =>
            subcommand.setName('reset').setDescription('Reset all sickness tallies (Admin only)')
        )
];

const env = getEnv();
const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);

client.on('interactionCreate', async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName !== 'sick') return;

    const subcommand = interaction.options.getSubcommand();
    const user = interaction.options.getUser('user') || interaction.user;

    if (user === null) {
        await interaction.reply('User not found. Please specify a valid user.');
        return;
    }

    switch (subcommand) {
        case 'add':
            await handleAdd(interaction);
            break;
        case 'remove':
            await handleRemove(interaction);
            break;
        case 'scoreboard':
            await handleScoreboard(interaction);
            break;
        case 'reset':
            await handleReset(interaction);
            break;
    }
});

client.login(env.DISCORD_TOKEN);

(async (): Promise<void> => {
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(Routes.applicationCommands(env.CLIENT_ID), { body: commands });
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
