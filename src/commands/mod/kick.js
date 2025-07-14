const { PermissionFlagsBits, MessageFlags } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = async function handleKick(interaction) {
	// Get user and reason from interaction options
	const targetUser = interaction.options.getUser('user');
	const reason = interaction.options.getString('reason') || 'No reason provided';

	// Check permissions
	if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
		await interaction.reply({ content: 'You do not have permission to use this command.', flags: MessageFlags.Ephemeral });
		return;
	}

	// Check if the user is in the guild
	const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
	if (!member) {
		await interaction.reply({ content: 'That user is not a member of this server.', flags: MessageFlags.Ephemeral });
		return;
	}

	// Prevent self-kick
	if (targetUser.id === interaction.user.id || targetUser.id === interaction.client.user.id) {
		const errorEmbed = new EmbedBuilder()
			.setColor(0xed4245)
			.setTitle('***Error***')
			.setDescription('You cannot kick yourself or the bot.');
		return interaction.reply({ embeds: [errorEmbed], flags: MessageFlags.Ephemeral });
	}


	// Create an embed
	const embed = new EmbedBuilder()
		.setColor(0x5865f2)
		.setTitle('***Kick Request***')
		.setDescription(`Are you certain you want to kick ${targetUser}?\n*This action is immediate and will notify the user.*`)
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
				await targetUser.send(`You have been kicked from ${interaction.guild.name} for ${reason}`);
			}
			catch {
				console.warn(`Could not DM ${targetUser.tag}, proceeding with kick.`);
			}

			const updatedEmbed = EmbedBuilder.from(embed)
				.setThumbnail(null)
				.setTitle('***Kick Request Confirmed***')
				.setDescription(`*${targetUser} is kicked for ${reason}.*`)
				.setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
				.setTimestamp();

			await interaction.guild.members.kick(targetUser, { reason });
			await confirmation.update({ embeds: [updatedEmbed], components: [] });
		}
		else if (confirmation.customId === 'cancel') {
			const updatedEmbed = EmbedBuilder.from(embed)
				.setThumbnail(null)
				.setTitle('***Kick Request Canceled***')
				.setDescription(`*The kick for ${targetUser} has been canceled.*`)
				.setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
				.setTimestamp();

			await confirmation.update({ embeds: [updatedEmbed], components: [] });
		}
	}
	catch (error) {
		console.error('Button interaction timed out or failed:', error);
		const updatedEmbed = EmbedBuilder.from(embed)
			.setThumbnail(null)
			.setTitle('***Kick Request Withdrawn***')
			.setDescription(`*The kick window for ${targetUser} has been withdrawn.*`)
			.setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
			.setTimestamp();

		await response.resource.message.edit({ embeds: [updatedEmbed], components: [] });
	}
};