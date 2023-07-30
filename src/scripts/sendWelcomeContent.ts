#!/usr/bin/env ts-node

/**
 * @file Send content for the welcome channel.
 */

import BotClient from '../util/botClient'
import { ActionRowBuilder, GatewayIntentBits, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js'
import dotenv from 'dotenv'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import yesno from 'yesno'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const guildId = process.env.GUILD_ID
const channelId = process.env.WELCOME_CHANNEL_ID

if (!guildId) {
  console.log('GUILD_ID not set in .env!')
  process.exit(1)
}

if (!channelId) {
  console.log('WELCOME_CHANNEL_ID not set in .env!')
  process.exit(1)
}

const welcomeContent = await fs.readFile(path.join(__dirname, '..', '..', 'data', 'welcome-message.md'), 'utf-8')

const selectMenu = new StringSelectMenuBuilder()
  .setCustomId('onboarding-role-select')
  .setPlaceholder('I am a...')
  .addOptions([
    new StringSelectMenuOptionBuilder().setLabel('Current Student').setValue('student').setEmoji('📚'),
    new StringSelectMenuOptionBuilder().setLabel('Alum').setValue('alum').setEmoji('🎓'),
    new StringSelectMenuOptionBuilder().setLabel('Faculty Member').setValue('faculty').setEmoji('🧑‍🏫'),
    new StringSelectMenuOptionBuilder().setLabel('Guest').setValue('guest').setEmoji('👤'),
  ])

const client = new BotClient({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
})

console.log('logging in...')

await client.login(process.env.BOT_TOKEN)

console.log('logged in!')

const guild = await client.guilds.fetch(guildId)
const channel = await guild.channels.fetch(channelId)

if (!channel) {
  console.log('channel not found!')
  client.destroy()
  process.exit(1)
}

if (!channel.isTextBased()) {
  console.log('channel is not a text channel!')
  client.destroy()
  process.exit(1)
}

const ok = await yesno({
  question: `Send welcome content to #${channel.name} in ${guild.name}? (Y/n)`,
  defaultValue: true,
})

if (!ok) {
  console.log('Aborting...')
  client.destroy()
  process.exit(0)
}

await channel.send({
  content: welcomeContent,
  components: [new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu)],
})

console.log('sent welcome content!')

client.destroy()
