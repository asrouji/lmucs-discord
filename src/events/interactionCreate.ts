import { Events } from 'discord.js'
import { createEvent } from '../types/event'

import chatInputCommandHandler from '../handlers/chatInputCommand'
import stringSelectMenuHandler from '../handlers/stringSelectMenu'
import modalSubmitHandler from '../handlers/modalSubmit'

const event = createEvent({
  name: Events.InteractionCreate,
  once: false,
  execute: async interaction => {
    if (interaction.isChatInputCommand()) {
      chatInputCommandHandler.handle(interaction)
    } else if (interaction.isStringSelectMenu()) {
      stringSelectMenuHandler.handle(interaction)
    } else if (interaction.isModalSubmit()) {
      modalSubmitHandler.handle(interaction)
    } else {
      console.error(`Unknown interaction (type ${interaction.type})`)
    }
  },
})

export default event
