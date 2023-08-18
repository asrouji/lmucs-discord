import { EmbedBuilder, GuildMember, GuildMemberRoleManager, ModalSubmitInteraction, TextChannel } from 'discord.js'
import InteractionHandler from '../types/handler'
import dotenv from 'dotenv'
import { WELCOME_MESSAGES } from '../util/constants'

dotenv.config()

const handler: InteractionHandler<ModalSubmitInteraction> = {
  handle: async interaction => {
    if (interaction.customId.startsWith('onboarding-modal')) {
      // new member finished onboarding!

      if (!interaction.member) {
        console.error(`No member found for user ${interaction.member}`)
        await interaction.deferUpdate()
        return
      }

      const fullName = interaction.fields.getTextInputValue('onboarding-prompt-full-name')

      try {
        await (interaction.member as GuildMember).setNickname(fullName)
      } catch (error) {
        console.error(`Insufficient permissions to change nickname for ${interaction.user.username}`)
      } finally {
        await interaction.deferUpdate()
      }

      // assign appropriate role to user
      const selection = interaction.customId.split('-')[2] as 'student' | 'alum' | 'guest'
      const roleMap = {
        student: process.env.STUDENT_ROLE_ID,
        alum: process.env.ALUMNI_ROLE_ID,
        guest: process.env.GUEST_ROLE_ID,
      }
      const role = interaction.guild?.roles.cache.find(role => role.id === roleMap[selection])
      if (!role) {
        console.error(`Could not find role ${selection} for user ${interaction.member}`)
      } else {
        try {
          await (interaction.member.roles as GuildMemberRoleManager).add(role)
        } catch (error) {
          console.error(`Insufficient permissions to add role ${selection} for ${interaction.member}`)
        }
      }

      // send welcome message to #general
      const generalChannelId = process.env.GENERAL_CHANNEL_ID
      const generalChannel = interaction.guild?.channels.cache.find(channel => channel.id === generalChannelId)
      if (!generalChannelId) {
        console.error(`No general channel ID found`)
      } else if (!interaction.guild) {
        console.error(`No guild found for interaction`)
      } else if (!generalChannel || !generalChannel.isTextBased()) {
        console.error(`Could not find general channel with ID ${generalChannelId}`)
      } else {
        const welcomeMessage = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)]
        const joinEmoji = interaction.guild.emojis.cache.find(emoji => emoji.id === process.env.JOIN_EMOJI_ID || '')
        await generalChannel
          .send({
            content: `${joinEmoji ? `${joinEmoji}  ` : ''}${welcomeMessage.replaceAll(
              '{user}',
              interaction.user.toString()
            )}`,
          })
          .catch(console.error)
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
            name: '4. Click "Add webhook"',
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
