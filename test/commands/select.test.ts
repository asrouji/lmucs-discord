import selectCommand from '../../src/commands/select'
import { CommandInteraction, InteractionResponse, StringSelectMenuInteraction } from 'discord.js'
import { MockProxy, mock } from 'jest-mock-extended'

let selectMenuInteraction: MockProxy<StringSelectMenuInteraction>
let interactionResponse: MockProxy<InteractionResponse>
let slashCommandInteraction: MockProxy<CommandInteraction>

beforeEach(() => {
  // Mock console.log and console.error to prevent them from logging to the console
  console.log = jest.fn()
  console.error = jest.fn()

  selectMenuInteraction = mock<StringSelectMenuInteraction>({
    valueOf: jest.fn(),
    user: {
      id: '1234567890',
      toString: jest.fn(),
      valueOf: jest.fn(),
    },
    customId: 'select_menu',
  })
  selectMenuInteraction.values = ['option_1']

  interactionResponse = mock<InteractionResponse>({
    awaitMessageComponent: jest.fn().mockImplementation(async ({ filter }) => {
      if (filter(selectMenuInteraction)) {
        return selectMenuInteraction
      } else {
        throw new Error('No option selected')
      }
    }),
  })

  slashCommandInteraction = mock<CommandInteraction>({
    reply: jest.fn().mockResolvedValue(interactionResponse),
    valueOf: jest.fn(),
    user: {
      id: '1234567890',
      toString: jest.fn(),
      valueOf: jest.fn(),
    },
  })
})

test("replies with the user's selection", async () => {
  await selectCommand.execute(slashCommandInteraction)

  // The command should reply with the select menu
  expect(slashCommandInteraction.reply).toHaveBeenCalled()

  // We should recieve the user's selection in the response
  expect(interactionResponse.awaitMessageComponent).toHaveBeenCalledWith({
    filter: expect.any(Function),
    time: expect.any(Number),
  })

  // The select menu should be updated after an option is selected
  expect(selectMenuInteraction.update).toHaveBeenCalledWith({
    // the content should include the user's selection
    content: expect.stringContaining('option_1'),
    // select menu should have been deleted
    components: [],
  })
})

test('edits the message when no option is selected in time', async () => {
  // Mock the interaction to not reply in time
  interactionResponse.awaitMessageComponent.mockImplementation(() => {
    throw new Error('No option selected')
  })

  await selectCommand.execute(slashCommandInteraction)

  // No option was selected, so there should be no reply to the select menu
  expect(selectMenuInteraction.reply).not.toHaveBeenCalled()
  // The response should have been edited to indicate that no option was selected
  expect(interactionResponse.edit).toHaveBeenCalled()
})

test('menu does not respond to other users', async () => {
  selectMenuInteraction.user.id = '0987654321'

  await selectCommand.execute(slashCommandInteraction)

  // We should not update the select menu if the user is not the one who selected an option
  expect(selectMenuInteraction.update).not.toHaveBeenCalled()
})
