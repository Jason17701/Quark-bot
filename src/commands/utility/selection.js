const { SlashCommandBuilder } = require('discord.js');
const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');


module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('selection')
		.setDescription('Select an option from a dropdown menu.'),


	async execute(interaction) {

		// Create a string select menu with options
		const select = new StringSelectMenuBuilder()
			.setCustomId('starter')
			.setPlaceholder('Make a selection')
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel('Bulbasaur')
					.setDescription('The Grass-type starter Pokémon')
					.setValue('bulbasaur'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Charmander')
					.setDescription('The Fire-type starter Pokémon')
					.setValue('charmander'),
				new StringSelectMenuOptionBuilder()
					.setLabel('Squirtle')
					.setDescription('The Water-type starter Pokémon')
					.setValue('squirtle'),
			);

		// Create an action row to hold the select menu
		const row = new ActionRowBuilder()
			.addComponents(select);

		await interaction.reply({
			content: 'Please select your starter Pokémon:',
			components: [row],
		});

		// Create a collector to handle the selection
		const filter = i => i.customId === 'starter' && i.user.id === interaction.user.id;
		const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

		collector.on('collect', async i => {
			if (i.isStringSelectMenu()) {
				const selectedValue = i.values[0];
				let response;

				switch (selectedValue) {
				case 'bulbasaur':
					response = 'You selected Bulbasaur, the Grass-type starter!';
					break;
				case 'charmander':
					response = 'You selected Charmander, the Fire-type starter!';
					break;
				case 'squirtle':
					response = 'You selected Squirtle, the Water-type starter!';
					break;
				default:
					response = 'Unknown selection.';
				}

				await i.update({ content: response, components: [] });
			}
		});
	},
};