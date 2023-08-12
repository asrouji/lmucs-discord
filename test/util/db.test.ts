import { runQuery } from '../../src/util/db'
import mysql from 'mysql'

jest.mock('mysql', () => ({
  createConnection: jest.fn().mockReturnValue({
    query: jest.fn().mockImplementation((query, values, callback) => {
      if (query === 'error') throw new Error('error')
      callback(undefined, `result${values ? ` ${values.join(' ')}` : ''}`)
    }),
  }),
}))

beforeAll(() => {
  console.error = jest.fn()
})

describe('runQuery', () => {
  test('runs the given query and returns the result', async () => {
    const result = await runQuery('SELECT * FROM test')
    expect(result).toBe('result')
  })

  test('throws an error if the query fails', async () => {
    await expect(runQuery('error')).rejects.toThrow('error')
  })

  test('passes the values to the query', async () => {
    const result = await runQuery('SELECT * FROM test WHERE id = ? AND name = ?', ['1', 'test'])
    expect(result).toBe('result 1 test')
  })
})
