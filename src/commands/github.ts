import {
  ActionRowBuilder,
  ModalBuilder,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js'
import Command from '../types/command'

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('github')
    .setDescription('GitHub feed commands')
    .addSubcommand(new SlashCommandSubcommandBuilder().setName('add').setDescription('Add a GitHub repo to the feed')),

  execute: async interaction => {
    const modal = new ModalBuilder().setTitle('GitHub Feed').setCustomId('github-feed')

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId('github-username')
          .setLabel('GitHub Username')
          .setPlaceholder('asrouji')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      ),
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId('github-reponame')
          .setLabel('GitHub Repo Name')
          .setPlaceholder('lmucs-discord')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      )
    )

    await interaction.showModal(modal)
  },
}

export default command
