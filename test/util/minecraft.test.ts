import { addPlayer, getServerStatus } from '../../src/util/minecraft'
import { mock } from 'node:test'
import { sendRconCommand } from '../../src/util/rcon'
import { runQuery } from '../../src/util/db'

jest.mock('../../src/util/rcon', () => ({
  sendRconCommand: jest.fn(),
}))

jest.mock('../../src/util/db', () => ({
  runQuery: jest.fn(),
}))

let originalEnv: NodeJS.ProcessEnv

beforeAll(() => {
  originalEnv = process.env
  process.env.MINECRAFT_SERVER_IP = '123'
  console.error = jest.fn()
})

afterAll(() => {
  process.env = originalEnv
  jest.resetAllMocks()
})

describe('addPlayer', () => {
  it('should add a player to the database and whitelist', async () => {
    ;(runQuery as jest.Mock).mockResolvedValue([])
    ;(sendRconCommand as jest.Mock).mockResolvedValue('Added Username to the whitelist')

    const result = await addPlayer('123', 'Username')
    expect(result).toBe(true)

    expect(runQuery).toBeCalledWith(expect.stringContaining('INSERT'), ['123', 'Username'])
    expect(sendRconCommand).toBeCalledWith('whitelist add Username')
  })

  it('should update the database instead of adding a new entry if they already exist', async () => {
    ;(runQuery as jest.Mock).mockResolvedValue([{ MinecraftUsername: 'OldUsername' }])
    ;(sendRconCommand as jest.Mock).mockResolvedValue('Added Username to the whitelist')

    const result = await addPlayer('123', 'Username')
    expect(result).toBe(true)

    expect(runQuery).toBeCalledWith(expect.stringContaining('UPDATE'), ['Username', '123'])
    expect(sendRconCommand).toBeCalledWith('whitelist add Username')
  })

  it('returns false if the player is already whitelisted', async () => {
    ;(runQuery as jest.Mock).mockResolvedValue([])
    ;(sendRconCommand as jest.Mock).mockResolvedValue('Username is already whitelisted')

    const result = await addPlayer('123', 'Username')
    expect(result).toBe(false)
  })
})

describe('getServerStatus', () => {
  it('should return the server status', async () => {
    mock.method(global, 'fetch', () => {
      return new Promise(resolve => {
        resolve({
          json: () => {
            return {
              online: true,
              ip: '123',
              version: '1.19.4',
              players: { online: 1, max: 50, list: ['Player'] },
            }
          },
        })
      })
    })

    const result = await getServerStatus()
    expect(result).toEqual({
      online: true,
      ip: '123',
      version: '1.19.4',
      players: { online: 1, max: 50, list: ['Player'] },
    })
  })

  it('should return undefined if server IP is not defined', async () => {
    const ip = process.env.MINECRAFT_SERVER_IP
    delete process.env.MINECRAFT_SERVER_IP
    const result = await getServerStatus()
    expect(result).toBeUndefined()
    process.env.MINECRAFT_SERVER_IP = ip
  })
})
