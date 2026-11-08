import { Client, GatewayIntentBits, REST, Routes, Interaction } from 'discord.js';
import dotenv from 'dotenv';
import { CommandNames } from './config/constants';
import commands from './config/command-definitions';
import ActionHandler from './action-handler';

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

const env = getEnv();
const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);

client.on('interactionCreate', async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName !== CommandNames.Sick) return;

    const subcommand = interaction.options.getSubcommand();
    const user = interaction.options.getUser('user') || interaction.user;

    if (user === null) {
        await interaction.reply('User not found. Please specify a valid user.');
        return;
    }

    const actionHandler = new ActionHandler(interaction);

    switch (subcommand) {
        case CommandNames.Add:
            await actionHandler.add();
            break;
        case CommandNames.Remove:
            await actionHandler.remove();
            break;
        case CommandNames.Scoreboard:
            await actionHandler.scoreboard();
            break;
        case CommandNames.Reset:
            await actionHandler.reset();
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
