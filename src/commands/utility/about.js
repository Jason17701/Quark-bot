const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const figlet = require('figlet');

module.exports = {
	category: 'utility',
	data: new SlashCommandBuilder()
		.setName('about')
		.setDescription('Provides information about Quark.'),
	async execute(interaction) {
		if (!interaction.guild) {
			return interaction.reply('This command can only be used in a server.');
		}

		const asciiTitle = figlet.textSync('Quark', {
			font: 'Slant',
			horizontalLayout: 'default',
			verticalLayout: 'vertical smushing',
		});

		const divider = '=======================================';

		const embed = new EmbedBuilder()
			.setColor(0x02d587)
			.setDescription(`\`\`\`${asciiTitle}\`\`\``)
			.addFields(
				{ name: '\u200B', value:`
					Hey there, I'm **Quark**!
					*Currently in development.*

					**[Jason17701](https://github.com/Jason17701/Quark-bot)**
					- Implementing utility commands\n
					${divider}
				` },
			)
			.setFooter({
				text: `Request made by ${interaction.user.tag}`,
				iconURL: interaction.user.displayAvatarURL(),
			});
		await interaction.reply({ embeds: [embed] });
	},
};
