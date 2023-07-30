import { GuildMember, ModalSubmitInteraction } from 'discord.js'
import InteractionHandler from '../types/handler'

const handler: InteractionHandler<ModalSubmitInteraction> = {
  handle: async interaction => {
    if (interaction.customId === 'onboarding-modal') {
      const fullName = interaction.fields.getTextInputValue('onboarding-prompt-full-name')
      if (!(interaction.member instanceof GuildMember)) {
        interaction.deferUpdate()
        console.error(`Interaction member ${interaction.user.username} is not a GuildMember`)
        return
      }
      try {
        await interaction.member.setNickname(fullName)
      } catch (error) {
        console.error(`Insufficient permissions to change nickname for ${interaction.user.username}`)
      } finally {
        await interaction.deferUpdate()
      }
    } else {
      console.error(`Unknown ModalSubmitInteraction ${interaction.customId}`)
      interaction.deferUpdate()
    }
  },
}

export default handler
