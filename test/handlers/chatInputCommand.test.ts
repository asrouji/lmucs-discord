import { ChatInputCommandInteraction, Client, Collection, CommandInteraction, SlashCommandBuilder } from 'discord.js'
import chatInputCommandHandler from '../../src/handlers/chatInputCommand'
import { MockProxy, mock } from 'jest-mock-extended'
import BotClient from '../../src/util/botClient'
import Command from '../../src/types/command'

let client: MockProxy<BotClient>
let interaction: MockProxy<CommandInteraction>

beforeAll(() => {
  // Mock console.log and console.error to prevent them from logging to the console
  console.log = jest.fn()
  console.error = jest.fn()
})

beforeEach(() => {
  // Create a mock client and interaction for each test
  client = mock<BotClient>()
  interaction = mock<CommandInteraction>({
    isCommand: jest.fn().mockReturnValue(true),
    isChatInputCommand: jest.fn().mockReturnValue(true),
    client: client as Client<true>,
    valueOf: jest.fn(),
  }) as unknown as MockProxy<CommandInteraction>
})

test('finds and executes the correct command', async () => {
  // Create two commands, one with the correct name and one with an incorrect name
  const correctCommand: Command = {
    data: new SlashCommandBuilder().setName('correct').setDescription('Correct command'),
    execute: jest.fn(),
  }
  const incorrectCommand: Command = {
    data: new SlashCommandBuilder().setName('incorrect').setDescription('Incorrect command'),
    execute: jest.fn(),
  }

  // Add both commands to the client
  client.commands = new Collection<string, Command>()
  client.commands.set(correctCommand.data.name, correctCommand)
  client.commands.set(incorrectCommand.data.name, incorrectCommand)

  interaction.commandName = correctCommand.data.name

  await chatInputCommandHandler.handle(interaction as ChatInputCommandInteraction)

  // Ensure that the correct command was executed
  expect(correctCommand.execute).toHaveBeenCalledWith(interaction)
  // Ensure that the incorrect command was not executed
  expect(incorrectCommand.execute).not.toHaveBeenCalled()
})

// test('does not execute if the interaction is not a command', async () => {
//   client.commands.get = jest.fn()
//   interaction.isCommand.mockReturnValue(false)
//   interaction.isChatInputCommand.mockReturnValue(false)

//   await chatInputCommandHandler.handle(interaction as ChatInputCommandInteraction)

//   // Ensure we did not try to find a command, since this is not a command interaction
//   expect(client.commands.get).not.toHaveBeenCalled()
// })

test('does not execute if the command does not exist', async () => {
  client.commands = new Collection<string, Command>()
  interaction.commandName = 'test123'

  console.error = jest.fn()

  await chatInputCommandHandler.handle(interaction as ChatInputCommandInteraction)

  // Ensure that the error was logged
  expect(console.error).toHaveBeenCalled()
  // Ensure we still replied to the interaction
  expect(interaction.reply).toHaveBeenCalled()
})

test('catches errors in the command execution', async () => {
  const command: Command = {
    data: new SlashCommandBuilder().setName('command').setDescription('Command'),
    execute: jest.fn().mockRejectedValue(new Error('Test error')),
  }

  client.commands = new Collection<string, Command>()
  client.commands.set(command.data.name, command)

  interaction.commandName = command.data.name

  console.error = jest.fn()

  await chatInputCommandHandler.handle(interaction as ChatInputCommandInteraction)

  // Ensure that the error was logged
  expect(console.error).toHaveBeenCalled()
  // Ensure that we still replied to the interaction
  expect(interaction.reply).toHaveBeenCalled()
})
