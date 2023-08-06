import {
  CommandInteractionOptionResolver,
  EmbedBuilder,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from 'discord.js'
import Command from '../types/command'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { Rcon } from 'rcon-client'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('minecraft')
    .setDescription('Minecraft server commands')
    .addSubcommand(
      new SlashCommandSubcommandBuilder().setName('server').setDescription('View info on the LMUCS Minecraft server')
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName('add')
        .setDescription('Add a Minecraft username to the server whitelist')
        .addStringOption(option => option.setName('username').setDescription('The username to add').setRequired(true))
    ),
  execute: async interaction => {
    const options = interaction.options as CommandInteractionOptionResolver
    const subcommand = options.getSubcommand(false)
    if (subcommand === 'server') {
      const ip = process.env.MINECRAFT_SERVER_IP
      if (!ip) {
        console.error('MINECRAFT_SERVER_IP is not defined in .env')
        await interaction.reply('Server is offline')
        return
      }
      const serverInfo = (await fetch('https://api.mcsrvstat.us/2/51.81.204.28').then(res => res.json())) as {
        online: boolean
        ip: string
        version: string
        icon: string
        players: { online: number; max: number; list: string[] }
      }
      if (!serverInfo.online) {
        await interaction.reply('Server is offline')
        return
      }
      const embed = new EmbedBuilder()
        .setTitle('LMUCS Minecraft Server')
        .setColor('#5b8731')
        .setDescription(`**Server IP:** mc.lmucs.io\n**Version:** Java ${serverInfo.version}`)
        .setFields([
          {
            name: `Players Online (${serverInfo.players.online}/${serverInfo.players.max})`,
            value: serverInfo.players.list.map(name => `• ${name}`).join('\n'),
          },
        ])
        .setThumbnail(`attachment://icon.jpg`)
        .setFooter({ text: 'Use "/minecraft add" to add your username!' })
      await interaction.reply({
        embeds: [embed],
        files: [{ attachment: path.join(__dirname, '..', '..', 'data', 'lmucs_white.jpg'), name: 'icon.jpg' }],
      })
    } else if (subcommand === 'add') {
      const username = options.getString('username')
      if (!username) {
        await interaction.reply('No username provided!')
        return
      }

      if (!process.env.MINECRAFT_SERVER_IP) {
        console.error('MINECRAFT_SERVER_IP is not defined in .env')
        await interaction.reply('Failed to connect to server')
        return
      }
      if (!process.env.RCON_PORT) {
        console.error('RCON_PORT is not defined in .env')
        await interaction.reply('Failed to connect to server')
        return
      }
      if (!process.env.RCON_PASSWORD) {
        console.error('RCON_PASSWORD is not defined in .env')
        await interaction.reply('Failed to connect to server')
        return
      }

      const rcon = new Rcon({
        host: process.env.MINECRAFT_SERVER_IP,
        port: Number(process.env.RCON_PORT),
        password: process.env.RCON_PASSWORD,
      })

      await rcon.connect()
      await rcon.send(`whitelist add ${username}`)
      await rcon.end()

      await interaction.reply(`Added \`${username}\` to the server whitelist!`)
    } else {
      await interaction.reply('Unknown subcommand!')
    }
  },
}

export default command
