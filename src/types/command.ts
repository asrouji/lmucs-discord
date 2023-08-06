import { CommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js'

/**
 * Interface for defining slash commands. Import the `SlashCommandBuilder` from discord.js to create the command data.
 */
export default interface Command {
  /** The command data for Discord to display (use a SlashCommandBuilder!) */
  data:
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>
    | SlashCommandSubcommandsOnlyBuilder
  /** The function to execute when the command is called */
  execute: (interaction: CommandInteraction) => Promise<unknown>
}
