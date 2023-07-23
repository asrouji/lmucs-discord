import { Client } from 'discord.js'
import readyEvent from '../../src/events/ready'
import { mock } from 'jest-mock-extended'

test('logs when the bot is ready', async () => {
  console.log = jest.fn()
  const client = mock<Client>()
  await readyEvent.execute(client)
  expect(console.log).toBeCalled()
})
