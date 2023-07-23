/**
 * @file Start the bot.
 * Run with `yarn dev` for development or `yarn start` for production.
 */

import BotClient from '../util/botClient'
import Command from '../types/command'
import { GatewayIntentBits } from 'discord.js'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const client = new BotClient({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
})

const commandsPath = path.join(__dirname, '..', 'commands')
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'))

for (const file of commandFiles) {
  const commandPath = path.join(commandsPath, file)
  const command: Command = (await import(pathToFileURL(commandPath).href)).default
  client.commands.set(command.data.name, command)
}

const eventsPath = path.join(__dirname, '..', 'events')
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts'))

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file)
  const event = (await import(pathToFileURL(filePath).href)).default
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args))
  } else {
    client.on(event.name, (...args) => event.execute(...args))
  }
}

client.login(process.env.BOT_TOKEN)
