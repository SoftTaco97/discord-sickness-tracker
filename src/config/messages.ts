// Error messages
const ERROR_MESSAGES: Record<string, string> = {
    MissingPermissions: "You do not have permission to modify other user's tallies.",
    GuildOnlyCommand: 'This command can only be used in a server.',
}

// Scoreboard
const SCOREBOARD_MESSAGES: Record<string, string> = {
    scoreBoard: `**Scoreboard:**\n{1}`,
    scoreBoardEntry: '<@{1}>: {2}',
    noTallies: 'No sickness tallies yet.',
}

// Reset
const RESET_MESSAGES: Record<string, string> = {
    onlyAdminsCanReset: 'Only admins can reset tallies. Nice try though.',
    resetTallies: 'All tallies for this guild have been reset.',
}

// Addition
const TALLY_ADDED_MESSAGES: { success: string[] } = {
    success: [
        'BREAKING NEWS: <@{1}> has been diagnosed with another case of the sick. Their tally is now {2}. Thoughts and prayers.',
        '<@{1}> is collecting sickness tallies like Pokémon. Gotta catch them all! Total: {2}.',
        'Someone get a doctor! <@{1}> is getting worse. Their tally is now {2}.',
        '<@{1}> has officially become a public health concern. Tally: {2}.',
        'The sickness claims another victory over <@{1}>. Total infections: {2}.',
        '<@{1}> has tested positive for being a menace. Their tally is now {2}.',
        'Another one bites the dust! <@{1}> now has {2} sickness tallies.',
        '<@{1}> needs to stop licking doorknobs. Tally increased to {2}.',
        'Scientists are studying <@{1}>. The results are not looking good. Tally: {2}.',
        '<@{1}> continues their brave journey toward becoming the sickest person alive. Total: {2}.',
    ]
};

// Subtraction
const TALLY_SUBTRACTED_MESSAGES: { noTalliesToRemove: string, success: string[] } = {
    noTalliesToRemove: '<@{1}> has no tallies to remove.',
    success: [
        'MIRACLE RECOVERY! <@{1}> has shown signs of improvement. Their tally is now {2}.',
        '<@{1}> finally took their medicine. Tally decreased to {2}.',
        'The healing powers of questionable medicine have worked! <@{1}> is down to {2}.',
        '<@{1}> has been discharged from the clown hospital. Remaining tally: {2}.',
        '<@{1}> has been cleansed of one sickness. The exorcism worked! Total: {2}.',
        'One less problem! <@{1}> has had a sickness tally removed. Now at {2}.',
        'Doctors are calling it a recovery. <@{1}> is now at {2}.',
        '<@{1}> has beaten one illness. Only {2} to go!',
        'A highly trained medical duck has cured <@{1}> of one sickness. Remaining tally: {2}.',
        '<@{1}> is slowly returning to society. Their tally is now {2}.',
    ]
}

export {
    ERROR_MESSAGES,
    SCOREBOARD_MESSAGES,
    TALLY_ADDED_MESSAGES,
    TALLY_SUBTRACTED_MESSAGES,
    RESET_MESSAGES,
}