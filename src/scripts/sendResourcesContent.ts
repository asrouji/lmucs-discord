#!/usr/bin/env ts-node

/**
 * @file Send content for the resources channel.
 */

import BotClient from '../util/botClient'
import { GatewayIntentBits } from 'discord.js'
import dotenv from 'dotenv'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import yesno from 'yesno'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const guildId = process.env.GUILD_ID
const channelId = process.env.RESOURCES_CHANNEL_ID

if (!guildId) {
  console.log('GUILD_ID not set in .env!')
  process.exit(1)
}

if (!channelId) {
  console.log('RESOURCES_CHANNEL_ID not set in .env!')
  process.exit(1)
}

const resourcesContent = await fs.readFile(path.join(__dirname, '..', '..', 'data', 'resources.md'), 'utf-8')

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
  question: `Send resources content to #${channel.name} in ${guild.name}? (Y/n)`,
  defaultValue: true,
})

if (!ok) {
  console.log('Aborting...')
  client.destroy()
  process.exit(0)
}

await channel.send({ content: resourcesContent })

console.log('sent resources content!')

client.destroy()
