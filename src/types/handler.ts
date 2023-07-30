import { BaseInteraction } from 'discord.js'

export default interface InteractionHandler<T extends BaseInteraction> {
  handle(interaction: T): Promise<unknown>
}
