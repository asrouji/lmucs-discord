/**
 * @file Deletes all global slash commands
 * Run with `yarn delete-commands`
 */

import { REST, Routes } from 'discord.js'
import dotenv from 'dotenv'
import yesno from 'yesno'

const ok = await yesno({
  question: 'Are you sure you want to delete all global slash commands? (y/N)',
  defaultValue: false,
})

if (!ok) {
  console.log('Aborting...')
  process.exit(0)
}

dotenv.config()

if (!process.env.BOT_TOKEN) {
  console.error('[ERROR] No BOT_TOKEN provided in the .env file.')
  process.exit(1)
}

const rest = new REST().setToken(process.env.BOT_TOKEN)

if (!process.env.CLIENT_ID) {
  console.error('[ERROR] No CLIENT_ID provided in the .env file.')
  process.exit(1)
}

try {
  console.log(`Started deleting application (/) commands.`)
  await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] })
  console.log(`Successfully deleted application (/) commands.`)
} catch (error) {
  console.error(error)
}
