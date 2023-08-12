import {
  CommandInteractionOptionResolver,
  EmbedBuilder,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from 'discord.js'
import Command from '../types/command'
import dotenv from 'dotenv'
import { addPlayer, getServerStatus } from '../util/minecraft'
import { runQuery } from '../util/db'

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
        .setDescription('Add a Minecraft username to the server. Please do not add other people!')
        .addStringOption(option =>
          option.setName('username').setDescription('The minecraft username to add').setRequired(true)
        )
    ),
  execute: async interaction => {
    const options = interaction.options as CommandInteractionOptionResolver
    const subcommand = options.getSubcommand(false)

    if (subcommand === 'server') {
      const hostname = process.env.MINECRAFT_SERVER_HOSTNAME
      const serverInfo = await getServerStatus()
      if (!serverInfo) {
        await interaction.reply('Server is offline')
        return
      }

      // Get the discord user for each player online
      const playerDetails = await Promise.all(
        serverInfo.players?.list?.map(async minecraftUsername => {
          const response = await runQuery<{
            DiscordID: string
          }>('SELECT * FROM players WHERE MinecraftUsername = ?', [minecraftUsername])
          const discordId = response[0]?.DiscordID
          if (discordId) {
            const user = await interaction.client.users.fetch(discordId)
            return `• ${user} (${minecraftUsername})`
          }
          return `• ${minecraftUsername}`
        }) || []
      )

      const embed = new EmbedBuilder()
        .setTitle('LMUCS Minecraft Server')
        .setColor('#5b8731')
        .setDescription(`**Server IP:** ${hostname}\n**Version:** Java ${serverInfo.version}`)
        .setFields([
          {
            name: `Players Online (${serverInfo.players?.online || 0}/${serverInfo.players?.max || 0})`,
            value: playerDetails.join('\n') || 'No players online',
          },
        ])
        .setFooter({ text: 'Use "/minecraft add" to add your username!' })
      await interaction.reply({ embeds: [embed] })
    } else if (subcommand === 'add') {
      const username = options.getString('username')
      if (!username) {
        await interaction.reply('No username provided!')
        return
      }

      const added = await addPlayer(interaction.user.id, username)
      await interaction.reply(
        added ? `\`${username}\` has been added to the server!` : `\`${username}\` is already added to the server!`
      )
    } else {
      await interaction.reply('Unknown subcommand!')
    }
  },
}

export default command
