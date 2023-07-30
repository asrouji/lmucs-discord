import InteractionHandler from '../types/handler'
import {
  ActionRowBuilder,
  ModalBuilder,
  StringSelectMenuInteraction,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js'

const handler: InteractionHandler<StringSelectMenuInteraction> = {
  handle: async interaction => {
    if (interaction.customId === 'onboarding-role-select') {
      const modal = new ModalBuilder().setCustomId('onboarding-modal').setTitle(`Welcome ${interaction.user.username}!`)

      const fullNameInput = new TextInputBuilder()
        .setCustomId('onboarding-prompt-full-name')
        .setLabel(`What is your full name?`)
        .setPlaceholder('First Last')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(100)

      modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(fullNameInput))

      await interaction.showModal(modal)
    } else {
      console.error(`Unknown StringSelectMenuInteraction ${interaction.customId}`)
      interaction.deferUpdate().catch(console.error)
    }
  },
}

export default handler
