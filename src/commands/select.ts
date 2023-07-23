import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  SlashCommandBuilder,
  StringSelectMenuOptionBuilder,
  ComponentType,
} from 'discord.js'
import Command from '../types/command'

const command: Command = {
  data: new SlashCommandBuilder().setName('select').setDescription('Sample select menu command'),
  execute: async interaction => {
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_menu')
      .setPlaceholder('Select an option...')
      .setOptions([
        new StringSelectMenuOptionBuilder()
          .setLabel('Option 1')
          .setValue('option_1')
          .setDescription('This is the first option'),
        new StringSelectMenuOptionBuilder()
          .setLabel('Option 2')
          .setValue('option_2')
          .setDescription('This is the second option'),
      ])

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)
    const response = await interaction.reply({ content: 'Choose an option!', components: [row], ephemeral: true })

    try {
      const confirmation = await response.awaitMessageComponent<ComponentType.StringSelect>({
        filter: i => i.customId === 'select_menu' && i.user.id === interaction.user.id,
        time: 10000, // how long the user has to respond
      })
      // the user responded, let's do something with it
      await confirmation.update({ content: `You selected \`${confirmation.values[0]}\`!`, components: [] })
    } catch (error) {
      // no response, remove the select menu and let the user know
      await response.edit({ content: `You did not select an option in time!`, components: [] })
    }
  },
}

export default command
