import { Rcon } from 'rcon-client'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Sends an RCON command to the Minecraft server
 * Requires the following environment variables:
 * - MINECRAFT_SERVER_IP
 * - RCON_PORT
 * - RCON_PASSWORD
 * @param command The command to send
 * @returns A promise that resolves to the response from the server
 */
export const sendRconCommand = async (command: string) => {
  if (!process.env.MINECRAFT_SERVER_IP) {
    console.error('MINECRAFT_SERVER_IP is not defined in .env')
    return undefined
  }
  if (!process.env.RCON_PORT) {
    console.error('RCON_PORT is not defined in .env')
    return undefined
  }
  if (!process.env.RCON_PASSWORD) {
    console.error('RCON_PASSWORD is not defined in .env')
    return undefined
  }

  const rcon = new Rcon({
    host: process.env.MINECRAFT_SERVER_IP,
    port: Number(process.env.RCON_PORT),
    password: process.env.RCON_PASSWORD,
  })
  await rcon.connect()
  const response = await rcon.send(command)
  await rcon.end()
  return response
}
