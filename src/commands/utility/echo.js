const { SlashCommandBuilder } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;


module.exports = {
	category: 'utility',
	// Create a new SlashCommandBuilder instance
	data: new SlashCommandBuilder()
		.setName('echo')
		.setDescription('Replies with your input!')

	// Add options to the command
	// The input option is a string that is required and has a maximum length of 2000 characters
	// The number option is a number that is optional and has a minimum value of 0 and a maximum value of 10
	// The delay option is a number that is optional and has choices for 1, 3, 5, and 10 seconds
		.addStringOption(option =>
			option.setName('input')
				.setDescription('The input to echo back')
				.setRequired(true)
				.setMaxLength(2_000))
		.addNumberOption(option =>
			option.setName('number')
				.setDescription('How many times to repeat the input')
				.setMinValue(0)
				.setMaxValue(10))
		.addNumberOption(option =>
			option.setName('delay')
				.setDescription('Delay in seconds before repeating the input')
				.addChoices(
					{ name: '1 second', value: 1 },
					{ name: '3 seconds', value: 3 },
					{ name: '5 seconds', value: 5 },
					{ name: '10 seconds', value: 10 },
				)),
	async execute(interaction) {

		// Get the input option from the interaction
		const input = interaction.options.getString('input', true);
		const repeatCount = interaction.options.getNumber('number');
		const delay = interaction.options.getNumber('delay');
		const seconds = delay * 1_000;


		await interaction.reply(input);

		if (repeatCount) {
			let i = 1;
			while (i < repeatCount) {
				await wait(seconds);
				await interaction.followUp(`${input}`);
				i++;
			}
		}
	},
};