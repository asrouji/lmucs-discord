import { Events } from 'discord.js'
import { createEvent } from '../types/event'
import BotClient from '../util/botClient'

const event = createEvent({
  name: Events.InteractionCreate,
  once: false,
  execute: async interaction => {
    if (interaction.isChatInputCommand()) {
      // we cast the client to our custom client to read the commands collection
      const command = (interaction.client as BotClient).commands.get(interaction.commandName)

      if (!command) {
        console.error(`Command ${interaction.commandName} not found.`)
        await interaction.reply({ content: 'Command not found on server!', ephemeral: true })
        return
      }

      try {
        await command.execute(interaction)
      } catch (error) {
        console.error(error)
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
      }
    }
  },
})

export default event
