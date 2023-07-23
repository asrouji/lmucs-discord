import BotClient from '../../src/util/botClient'

let client: BotClient

beforeEach(() => {
  client = new BotClient({ intents: [] })
})

test('creates a commands collection', () => {
  expect(client.commands).toBeDefined()
})
