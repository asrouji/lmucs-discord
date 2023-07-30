import pingCommand from '../../src/commands/ping'
import { CommandInteraction, WebSocketManager } from 'discord.js'
import { mock } from 'jest-mock-extended'

test('replies when called', async () => {
  const interaction = mock<CommandInteraction>()
  interaction.client.ws = { ping: 100 } as WebSocketManager
  await pingCommand.execute(interaction)
  expect(interaction.reply).toHaveBeenCalledTimes(1)
})
