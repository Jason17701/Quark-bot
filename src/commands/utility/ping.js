const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;


module.exports = {
	category: 'utility',
	// Create a new SlashCommandBuilder instance
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {

		// Discord send an error for interactions that take longer than 3 seconds to respond
		// deferReply() extends this period to 15 minutes
		// The first followup will edit the <application> is thinking message
		// Ephermeral messages are only visible to the user who invoked the command
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		await interaction.followUp('Processing...');
		await wait(5_000);
		await interaction.editReply('🏓 Pong!');

		// Follow up with a message after the initial reply
		// Create message object
		await wait(3_000);
		const followUp = await interaction.followUp({ content: 'I will now delete the initial Pong!', withResponse: true });

		// Delete initial reply
		await wait(2_000);
		await interaction.deleteReply();
		await followUp.edit('Goodbye!');

		// Delete the follow up message
		await wait(2_000);
		await followUp.delete();
	},
};