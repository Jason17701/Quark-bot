const { InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

module.exports = {
	category: 'moderation',
	// Create a new SlashCommandBuilder instance
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Select a member and kick them.')
		.addUserOption(option =>
			option
				.setName('target')
				.setDescription('The member to kick')
				.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
		.setContexts(InteractionContextType.Guild),

	async execute(interaction) {
		if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
       		return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
		}

		// Get the target user from the interaction options
		const target = interaction.options.getUser('target');

		if (target.id === interaction.user.id) {
			return interaction.reply({ content: 'You cannot kick yourself.', ephemeral: true });
		}

		// Check if the target user is a member of the guild
		const member = await interaction.guild.members.fetch(target.id).catch(() => null);
		if (!member) {
			return interaction.reply({ content: 'That user is not a member of this server.', ephemeral: true });
		}

		// Kick the member
		await member.kick({ reason: 'Kicked by command' });

		// Reply to the interaction
		return interaction.reply({ content: `${target.tag} has been kicked.`, ephemeral: true });
	},
};