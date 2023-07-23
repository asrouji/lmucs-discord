import { ClientEvents } from 'discord.js'

/**
 * Interface for defining event handlers. Import the `Events` enum from discord.js to see all possible events.
 * It is recommended to use the `createEvent` function to create an event, as it will infer the type of the event.
 * @template T The event name, e.g. `Events.ClientReady`
 */
export default interface Event<T extends keyof ClientEvents> {
  /** The name of the event */
  name: T
  /** Whether the event should only be executed once */
  once?: boolean
  /** The function to execute when the event is emitted */
  execute: (...args: ClientEvents[T]) => Promise<unknown>
}

/**
 * Creates an event handler with the `Event` interface.
 * @template T The event name, e.g. `Events.ClientReady`
 * @param event The event handler
 * @returns The event handler
 */
export const createEvent = <T extends keyof ClientEvents>(event: Event<T>) => event
