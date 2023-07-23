import pingCommand from '../../src/commands/ping'
import { CommandInteraction } from 'discord.js'
import { mock } from 'jest-mock-extended'

test('replies when called', async () => {
  const interaction = mock<CommandInteraction>()
  await pingCommand.execute(interaction)
  expect(interaction.reply).toHaveBeenCalledTimes(1)
})
