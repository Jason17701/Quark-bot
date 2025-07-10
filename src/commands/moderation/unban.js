const { InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

module.exports = {
	category: 'moderation',
	// Create a new SlashCommandBuilder instance
	data: new SlashCommandBuilder()
		.setName('unban')
		.setDescription('Select a member and unban them.')
		.addUserOption(option => option
			.setName('target')
			.setDescription('The member to unban')
			.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.setContexts(InteractionContextType.Guild),

	async execute(interaction) {
		if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
			return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
		}

		// Get the target user from the interaction options
		const target = interaction.options.getUser('target');

		// Check if the target user is banned
		const banList = await interaction.guild.bans.fetch();
		if (!banList.has(target.id)) {
			return interaction.reply({ content: 'That user is not banned from this server.', ephemeral: true });
		}

		// Unban the member
		await interaction.guild.members.unban(target.id, 'Unbanned by command');

		// Reply to the interaction
		return interaction.reply({ content: `${target.tag} has been unbanned.`, ephemeral: true });
	},
};