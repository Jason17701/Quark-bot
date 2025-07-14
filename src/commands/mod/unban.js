const { PermissionFlagsBits, MessageFlags } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = async function handleUnban(interaction) {
	// Get user and reason from interaction options
	const targetUser = interaction.options.getUser('user');
	const reason = interaction.options.getString('reason') || 'No reason provided';

	// Check permissions
	if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
		await interaction.reply({ content: 'You do not have permission to unban members.', flags: MessageFlags.Ephemeral });
		return;
	}

	// Check if the user is banned
	const banList = await interaction.guild.bans.fetch();
	if (!banList.has(targetUser.id)) {
		await interaction.reply({ content: 'That user is not banned from this server.', flags: MessageFlags.Ephemeral });
		return;
	}


	// Create an embed
	const embed = new EmbedBuilder()
		.setColor(0x5865f2)
		.setTitle('***Unban Request?***')
		.setDescription(`Are you certain you want to unban ${targetUser}?`)
		.setThumbnail(targetUser.displayAvatarURL());

	// Create buttons
	const cancel = new ButtonBuilder()
		.setCustomId('cancel')
		.setLabel('Cancel')
		.setStyle(ButtonStyle.Secondary);

	const confirm = new ButtonBuilder()
		.setCustomId('confirm')
		.setLabel('Confirm')
		.setStyle(ButtonStyle.Primary);

	// Create action row with buttons
	const row = new ActionRowBuilder()
		.addComponents(cancel, confirm);


	const response = await interaction.reply({
		embeds: [embed],
		components: [row],
		withResponse: true,
	});

	const collectorFilter = i => i.user.id === interaction.user.id;

	try {
		const confirmation = await response.resource.message.awaitMessageComponent({
			filter: collectorFilter,
			time: 60_000,
		});

		if (confirmation.customId === 'confirm') {
			const updatedEmbed = EmbedBuilder.from(embed)
				.setThumbnail(null)
				.setTitle('***Unban Request Confirmed***')
				.setDescription(`*${targetUser} is unbanned for ${reason}.*`)
				.setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
				.setTimestamp();


			await interaction.guild.members.unban(targetUser.id, { reason });
			await confirmation.update({ embeds: [updatedEmbed], components: [] });
		}
		else if (confirmation.customId === 'cancel') {
			const updatedEmbed = EmbedBuilder.from(embed)
				.setThumbnail(null)
				.setTitle('***Unban Request Canceled***')
				.setDescription(`*The unban for ${targetUser} has been canceled.*`)
				.setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
				.setTimestamp();


			await confirmation.update({ embeds: [updatedEmbed], components: [] });
		}
	}
	catch (error) {
		console.error('Button interaction timed out or failed:', error);
		const updatedEmbed = EmbedBuilder.from(embed)
			.setThumbnail(null)
			.setTitle('***Unban Request Withdrawn***')
			.setDescription(`*The ban window for ${targetUser} has been withdrawn.*`)
			.setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
			.setTimestamp();


		await response.resource.message.edit({ embeds: [updatedEmbed], components: [] });
	}
};