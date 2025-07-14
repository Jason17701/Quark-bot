const { PermissionFlagsBits, MessageFlags } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = async function handleBan(interaction) {
	// Get user and reason from interaction options
	const targetUser = interaction.options.getUser('user');
	const reason = interaction.options.getString('reason') ?? 'No reason provided';

	// Check permissions
	if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
		await interaction.reply({ content: 'You do not have permission to ban members.', flags: MessageFlags.Ephemeral });
		return;
	}

	// // Check if the user is in the guild
	// const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
	// if (!member) {
	// 	await interaction.reply({ content: 'That user is not a member of this server.', flags: MessageFlags.Ephemeral });
	// 	return;
	// }

	// Prevent self-ban or banning the bot
	if (targetUser.id === interaction.user.id || targetUser.id === interaction.client.user.id) {
		const errorEmbed = new EmbedBuilder()
			.setColor(0xed4245)
			.setTitle('***Error***')
			.setDescription('You cannot ban yourself or the bot.');
		return interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
	}


	// Create an embed
	const embed = new EmbedBuilder()
		.setColor(0x5865f2)
		.setTitle('***Ban Request***')
		.setDescription(`Are you certain you want to ban ${targetUser}?\n*This action is immediate and will notify the user.*`)
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

			// Attempt to DM the user before banning
			try {
				await targetUser.send(`You have been banned from ${interaction.guild.name} for ${reason}`);
			}
			catch {
      			console.warn(`Could not DM ${targetUser.tag}, proceeding with ban.`);
			}

			const updatedEmbed = EmbedBuilder.from(embed)
				.setThumbnail(null)
				.setTitle('***Ban Request Confirmed***')
				.setDescription(`*${targetUser} is banned for ${reason}.*`)
				.setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
				.setTimestamp();


			await interaction.guild.members.ban(targetUser, { reason });
			await confirmation.update({ embeds: [updatedEmbed], components: [] });
		}
		else if (confirmation.customId === 'cancel') {
			const updatedEmbed = EmbedBuilder.from(embed)
				.setThumbnail(null)
				.setTitle('***Ban Request Canceled***')
				.setDescription(`*The ban for ${targetUser} has been canceled.*`)
				.setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
				.setTimestamp();


			await confirmation.update({ embeds: [updatedEmbed], components: [] });
		}
	}
	catch (error) {
		console.error('Button interaction timed out or failed:', error);
		const updatedEmbed = EmbedBuilder.from(embed)
			.setThumbnail(null)
			.setTitle('***Ban Request Withdrawn***')
			.setDescription(`*The ban window for ${targetUser} has been withdrawn.*`)
			.setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
			.setTimestamp();


		await response.resource.message.edit({ embeds: [updatedEmbed], components: [] });
	}
};