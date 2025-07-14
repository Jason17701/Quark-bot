const { SlashCommandBuilder, PermissionFlagsBits, MessageFlags, InteractionContextType } = require('discord.js');
const handleBan = require('./ban');
const handleKick = require('./kick');
const handleUnban = require('./unban');

module.exports = {


	category: 'mod',
	// Create a new SlashCommandBuilder instance
	data: new SlashCommandBuilder()
		.setName('mod')
		.setDescription('Moderation commands')
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers | PermissionFlagsBits.BanMembers)

	// Subcommand for banning a user
		.addSubcommand(subcommand =>
			subcommand
				.setName('ban')
				.setDescription('Ban a user from the server')
				.addUserOption(option => option
					.setName('user')
					.setDescription('The user to ban')
					.setRequired(true))
				.addStringOption(option => option
					.setName('reason')
					.setDescription('The reason for the ban')
					.setRequired(false)))

	// Subcommand for unbanning a user
		.addSubcommand(subcommand =>
			subcommand
				.setName('unban')
				.setDescription('Unban a user from the server')
				.addUserOption(option => option
					.setName('user')
					.setDescription('The user to unban')
					.setRequired(true))
				.addStringOption(option => option
					.setName('reason')
					.setDescription('The reason for the unban')
					.setRequired(false)))

	// Subcommand for kicking a user
		.addSubcommand(subcommand =>
			subcommand
				.setName('kick')
				.setDescription('Kick a user from the server')
				.addUserOption(option => option
					.setName('user')
					.setDescription('The user to kick')
					.setRequired(true))
				.addStringOption(option => option
					.setName('reason')
					.setDescription('The reason for the kick')
					.setRequired(false)))

	// Only allow this command to be used in guilds
		.setContexts(InteractionContextType.Guild),


	// Execute the command based on the subcommand
	async execute(interaction) {
		// Check if the interaction is a chat input command
		if (!interaction.isChatInputCommand()) return;

		// Get the subcommand from the interaction
		const subcommand = interaction.options.getSubcommand();
		try {
			switch (subcommand) {
			    case 'ban': return handleBan(interaction);
			    case 'kick': return handleKick(interaction);
			    case 'unban': return handleUnban(interaction);
			    default: return interaction.reply({ content: 'Unknown subcommand', flags: MessageFlags.Ephemeral });
		    }
		}
		catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
		}
	},


};