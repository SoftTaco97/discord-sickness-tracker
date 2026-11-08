import { SlashCommandBuilder } from 'discord.js';
import { CommandNames } from './constants';

const commands = [
    new SlashCommandBuilder()
        .setName(CommandNames.Sick)
        .setDescription('Manage sickness tallies')
        .addSubcommand(subcommand =>
            subcommand
                .setName(CommandNames.Add)
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
                .setName(CommandNames.Remove)
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
            subcommand.setName(CommandNames.Scoreboard).setDescription('Show current scoreboard')
        )
        .addSubcommand(subcommand =>
            subcommand.setName(CommandNames.Reset).setDescription('Reset all sickness tallies (Admin only)')
        )
];

export default commands;