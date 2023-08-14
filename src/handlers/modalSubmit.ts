import { EmbedBuilder, GuildMember, ModalSubmitInteraction, TextChannel } from 'discord.js'
import InteractionHandler from '../types/handler'
import dotenv from 'dotenv'

dotenv.config()

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
    } else if (interaction.customId === 'github-feed') {
      const username = interaction.fields.getTextInputValue('github-username')
      const repoName = interaction.fields.getTextInputValue('github-reponame')

      if (!username || !repoName) {
        interaction.reply({ content: 'One or more fields were left blank, please try again.', ephemeral: true })
        return
      }

      const repoLink = `https://github.com/${username}/${repoName}/settings/hooks`

      const githubFeedChannel = interaction.guild?.channels.cache.find(
        channel => channel.id === process.env.GITHUB_FEED_CHANNEL_ID
      )

      if (!githubFeedChannel || !(githubFeedChannel instanceof TextChannel)) {
        console.error(`Could not find GitHub feed channel with ID ${process.env.GITHUB_FEED_CHANNEL_ID}`)
        interaction.reply({ content: 'Failed to create webhook, please try again later.', ephemeral: true })
        return
      }

      const webhook = await githubFeedChannel.createWebhook({
        // discord doesn't allow webhooks to have 'discord' in the name
        name: `${username}-${repoName.replace('discord', 'dscd')}`,
      })

      const embed = new EmbedBuilder()
        .setTitle('GitHub Feed Setup')
        .setColor('#ffffff')
        .setDescription(`Thanks ${interaction.user}! Just a few more steps to finish setup:`)
        .addFields(
          {
            name: '1. Go to your repository webhook settings',
            value: `${repoLink}`,
          },
          {
            name: '2. Paste the following URL into the "Payload URL" field:',
            value: `\`${webhook.url}/github\``,
          },
          {
            name: '3. Configure the webhook',
            value:
              '• Set `Content type` to `application/json`\n• Leave the `Secret` field blank\n• Trigger the webhook on `Just the push event`',
          },
          {
            name: '4. Click `Add webhook`',
            value: "After this, you're all set! You can dismiss this message.",
          }
        )

      await interaction.reply({ embeds: [embed], ephemeral: true })
    } else {
      console.error(`Unknown ModalSubmitInteraction ${interaction.customId}`)
      interaction.deferUpdate().catch(console.error)
    }
  },
}

export default handler
