const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	category: 'utility',
	// Create a new SlashCommandBuilder instance
	data: new SlashCommandBuilder()
		.setName('quote')
		.setDescription('Generates a random inspirational quote from InspiroBot.'),

	async execute(interaction) {
		try {
			const response = await fetch('https://inspirobot.me/api?generate=true');
			if (!response.ok) throw new Error(`HTTP ${response.status}`);

			const imageUrl = await response.text();

			await interaction.reply({
				content: '🧠 Here is your inspiration:',
				files: [imageUrl],
			});
		}
		catch (error) {
			console.error('❌ Failed to fetch InspiroBot image:', error);
			await interaction.reply({
				content: 'Failed to generate an InspiroBot quote. Please try again later.',
				// eslint-disable-next-line no-inline-comments
				flags: 64, // ephemeral message flag
			});
		}
	},
};
