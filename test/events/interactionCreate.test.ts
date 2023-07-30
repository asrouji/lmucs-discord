import { ChatInputCommandInteraction, Interaction, StringSelectMenuInteraction } from 'discord.js'
import { mock } from 'jest-mock-extended'
import interactionCreateEvent from '../../src/events/interactionCreate'
import chatInputCommandHandler from '../../src/handlers/chatInputCommand'
import stringSelectMenuHandler from '../../src/handlers/stringSelectMenu'
import modalSubmitHandler from '../../src/handlers/modalSubmit'

beforeAll(() => {
  console.error = jest.fn()
})

test('invokes the correct interaction handler', async () => {
  const chatInputCommandInteraction = mock<ChatInputCommandInteraction>({
    isCommand: jest.fn().mockReturnValue(true),
    isChatInputCommand: jest.fn().mockReturnValue(true),
    isStringSelectMenu: jest.fn().mockReturnValue(false),
    isModalSubmit: jest.fn().mockReturnValue(false),
    valueOf: jest.fn(),
  })

  const stringSelectMenuInteraction = mock<StringSelectMenuInteraction>({
    isCommand: jest.fn().mockReturnValue(false),
    isChatInputCommand: jest.fn().mockReturnValue(false),
    isStringSelectMenu: jest.fn().mockReturnValue(true),
    isModalSubmit: jest.fn().mockReturnValue(false),
    valueOf: jest.fn(),
  })

  const modalSubmitInteraction = mock<Interaction>({
    isCommand: jest.fn().mockReturnValue(false),
    isChatInputCommand: jest.fn().mockReturnValue(false),
    isStringSelectMenu: jest.fn().mockReturnValue(false),
    isModalSubmit: jest.fn().mockReturnValue(true),
    valueOf: jest.fn(),
  })

  // Spy on the handlers to see if they are called
  const chatInputCommandHandlerMock = jest.spyOn(chatInputCommandHandler, 'handle').mockImplementation()
  const stringSelectMenuHandlerMock = jest.spyOn(stringSelectMenuHandler, 'handle').mockImplementation()
  const modalSubmitHandlerMock = jest.spyOn(modalSubmitHandler, 'handle').mockImplementation()

  await interactionCreateEvent.execute(chatInputCommandInteraction)
  expect(chatInputCommandHandlerMock).toHaveBeenCalledTimes(1)
  expect(stringSelectMenuHandlerMock).not.toHaveBeenCalled()
  expect(modalSubmitHandlerMock).not.toHaveBeenCalled()

  jest.clearAllMocks()

  await interactionCreateEvent.execute(stringSelectMenuInteraction)
  expect(chatInputCommandHandlerMock).not.toHaveBeenCalled()
  expect(stringSelectMenuHandlerMock).toHaveBeenCalledTimes(1)
  expect(modalSubmitHandlerMock).not.toHaveBeenCalled()

  jest.clearAllMocks()

  await interactionCreateEvent.execute(modalSubmitInteraction)
  expect(chatInputCommandHandlerMock).not.toHaveBeenCalled()
  expect(stringSelectMenuHandlerMock).not.toHaveBeenCalled()
  expect(modalSubmitHandlerMock).toHaveBeenCalledTimes(1)
})

test('logs an error if no handler is found', async () => {
  const interaction = mock<Interaction>({
    isCommand: jest.fn().mockReturnValue(false),
    isChatInputCommand: jest.fn().mockReturnValue(false),
    isStringSelectMenu: jest.fn().mockReturnValue(false),
    isModalSubmit: jest.fn().mockReturnValue(false),
    valueOf: jest.fn(),
  })

  await interactionCreateEvent.execute(interaction)

  expect(console.error).toHaveBeenCalled()
})
