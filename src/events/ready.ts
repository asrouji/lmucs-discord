import { Events } from 'discord.js'
import { createEvent } from '../types/event'

const event = createEvent({
  name: Events.ClientReady,
  once: true,
  execute: async client => {
    console.log(`Logged in as ${client.user?.tag}`)
  },
})

export default event
