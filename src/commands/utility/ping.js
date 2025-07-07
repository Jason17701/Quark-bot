const { SlashCommandBuilder } = require('discord.js');


module.exports = {
	// Create a new SlashCommandBuilder instance
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};