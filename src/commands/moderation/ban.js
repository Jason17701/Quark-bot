const { InteractionContextType, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

module.exports = {
	category: 'moderation',
	// Create a new SlashCommandBuilder instance
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Select a member and ban them.')
		.addUserOption(option => option
			.setName('target')
			.setDescription('The member to ban')
			.setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.setContexts(InteractionContextType.Guild),

	async execute(interaction) {
		// Get the target user from the interaction options
		const target = interaction.options.getUser('target');

		// Check if the target user is a member of the guild
		const member = await interaction.guild.members.fetch(target.id).catch(() => null);
		if (!member) {
			return interaction.reply({ content: 'That user is not a member of this server.', ephemeral: true });
		}

		// Ban the member
		await member.ban({ reason: 'Banned by command' });

		// Reply to the interaction
		return interaction.reply({ content: `${target.tag} has been banned.`, ephemeral: true });
	},
};