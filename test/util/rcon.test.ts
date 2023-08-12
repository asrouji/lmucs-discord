import { sendRconCommand } from '../../src/util/rcon'

const sendReturnValue = 'Username was added to the whitelist'

jest.mock('rcon-client', () => ({
  Rcon: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    send: jest.fn().mockReturnValue(sendReturnValue),
    end: jest.fn(),
  })),
}))

beforeAll(() => {
  console.error = jest.fn()
})

test('catches any missing env variables', async () => {
  // test all combinations of missing env variables
  const originalEnv = process.env
  const envs = ['MINECRAFT_SERVER_IP', 'RCON_PORT', 'RCON_PASSWORD']
  for (let i = 0; i < envs.length; i++) {
    process.env = { ...originalEnv }
    delete process.env[envs[i]]
    const response = await sendRconCommand('whitelist add Username')
    expect(response).toBeUndefined()
  }
  process.env = originalEnv
})

test('sends the command and returns the response', async () => {
  process.env = {
    MINECRAFT_SERVER_IP: 'ip',
    RCON_PORT: 'port',
    RCON_PASSWORD: 'pass',
  }
  const response = await sendRconCommand('whitelist add Username')
  expect(response).toBe(sendReturnValue)
})
