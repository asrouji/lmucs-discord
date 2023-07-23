import { Client, ClientOptions, Collection } from 'discord.js'
import Command from '../types/command'

/**
 * Extension of the Discord.js Client class to include a collection of commands.
 * This can be extended further if needed!
 */
export default class BotClient extends Client {
  /** A collection of commands to be listened for by the bot */
  commands: Collection<unknown, Command>

  constructor(options: ClientOptions) {
    super(options)
    this.commands = new Collection()
  }
}
