import { SlashCommandBuilder } from 'discord.js'
import Command from '../types/command'

const command: Command = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
  execute: async interaction => await interaction.reply(`Pong! (${interaction.client.ws.ping}ms)`),
}

export default command
