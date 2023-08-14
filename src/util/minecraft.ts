import { sendRconCommand } from './rcon'
import { runQuery } from './db'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Adds a player to the server whitelist and database
 * @param discordId The Discord ID of the player
 * @param minecraftUsername The Minecraft username of the player
 * @returns A promise that resolves to true if the player was added, false if the player was already whitelisted
 */
export const addPlayer = async (discordId: string, minecraftUsername: string): Promise<boolean> => {
  // Check if Discord ID is already in database
  const existingPlayer = await runQuery('SELECT * FROM players WHERE DiscordID = ?', [discordId])
  // Add or update player in database
  const queryPromise =
    existingPlayer.length > 0
      ? runQuery('UPDATE players SET MinecraftUsername = ? WHERE DiscordID = ?', [minecraftUsername, discordId])
      : runQuery('INSERT INTO players (DiscordID, MinecraftUsername) VALUES (?, ?)', [discordId, minecraftUsername])
  // Add player to whitelist
  const rconPromise = sendRconCommand(`whitelist add ${minecraftUsername}`)
  const [, rconResult] = await Promise.all([queryPromise, rconPromise])
  if (rconResult?.includes('already whitelisted')) {
    return false
  }
  return true
}

/**
 * Gets the status of the Minecraft server
 * Requires MINCRAFT_SERVER_IP to be defined in .env
 * @returns A promise that resolves to the server status
 */
export const getServerStatus = async () => {
  const ip = process.env.MINECRAFT_SERVER_IP
  if (!ip) {
    console.error('MINECRAFT_SERVER_IP is not defined in .env')
    return undefined
  }
  const serverInfo = (await fetch(`https://api.mcsrvstat.us/2/${ip}`).then(res => res.json())) as {
    online: boolean
    ip: string
    version?: string
    players?: { online: number; max: number; list?: string[] }
  }
  return serverInfo
}
