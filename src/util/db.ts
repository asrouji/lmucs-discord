import mysql from 'mysql'

const db = mysql.createConnection(process.env.DB_URI || '')

export const runQuery = async <T>(query: string, values?: string[]) => {
  return new Promise<T[]>((resolve, reject) => {
    db.query(query, values, (err, results) => {
      if (err) reject(err)
      else resolve(results)
    })
  })
}
