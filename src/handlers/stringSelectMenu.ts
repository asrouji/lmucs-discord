import InteractionHandler from '../types/handler'
import {
  ActionRowBuilder,
  EmbedBuilder,
  ModalBuilder,
  StringSelectMenuInteraction,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js'
import dotenv from 'dotenv'

dotenv.config()

const handler: InteractionHandler<StringSelectMenuInteraction> = {
  handle: async interaction => {
    if (interaction.customId === 'onboarding-role-select') {
      const selection = interaction.values[0] as 'student' | 'alum' | 'faculty' | 'guest'

      // faculty/staff role requires manual verification
      if (selection === 'faculty') {
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor('#ffffff')
              .setDescription(
                `Hey there! This role requires manual verification; a request has been sent to server administrators. Sorry for the inconvenience!\n\nIf you selected this role in error, no worries! Just make a new selection above.`
              ),
          ],
          ephemeral: true,
        })
        const moderatorChannelId = process.env.MOD_CHANNEL_ID
        /* istanbul ignore if */
        if (!moderatorChannelId) {
          console.error('MOD_CHANNEL_ID not set in .env')
          return
        }
        const moderatorChannel = await interaction.guild?.channels?.fetch(moderatorChannelId)
        /* istanbul ignore else */
        if (moderatorChannel?.isTextBased()) {
          await moderatorChannel.send({
            embeds: [
              new EmbedBuilder()
                .setColor('#ffffff')
                .setTitle('New Faculty/Staff Role Request')
                .setDescription(
                  `User ${interaction.user} requested the faculty/staff role. Please verify them and assign appropriate roles.`
                ),
            ],
          })
        } else {
          console.error(`MOD_CHANNEL_ID ${moderatorChannelId} is not a valid text channel`)
        }
        return
      }

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
