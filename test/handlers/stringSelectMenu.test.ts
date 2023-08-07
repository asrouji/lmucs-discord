import { StringSelectMenuInteraction, TextChannel } from 'discord.js'
import { mock } from 'jest-mock-extended'
import stringSelectMenuHandler from '../../src/handlers/stringSelectMenu'

beforeAll(() => {
  console.error = jest.fn()
})

describe('onboarding role selection', () => {
  test('shows the onboarding modal on selection', async () => {
    const interaction = mock<StringSelectMenuInteraction>({
      customId: 'onboarding-role-select',
      values: ['student'],
      valueOf: jest.fn(),
      showModal: jest.fn(),
    })

    await stringSelectMenuHandler.handle(interaction)
    expect(interaction.showModal).toHaveBeenCalled()
  })

  test('sends a verification request for faculty/staff', async () => {
    const modChannel = mock<TextChannel>({
      isTextBased: jest.fn().mockReturnValue(true),
      send: jest.fn(),
      valueOf: jest.fn(),
      toString: jest.fn(),
    })
    const interaction = mock<StringSelectMenuInteraction>({
      customId: 'onboarding-role-select',
      values: ['faculty'],
      valueOf: jest.fn(),
      reply: jest.fn(),
      guild: {
        channels: {
          fetch: jest.fn().mockReturnValue(modChannel),
          valueOf: jest.fn(),
        },
        valueOf: jest.fn(),
      },
    })
    const oldEnv = process.env.MOD_CHANNEL_ID
    process.env.MOD_CHANNEL_ID = '1234567890'
    await stringSelectMenuHandler.handle(interaction)
    expect(interaction.reply).toHaveBeenCalled()
    expect(modChannel.send).toHaveBeenCalled()
    process.env.MOD_CHANNEL_ID = oldEnv
  })
})

test('defers the interaction if the customId does not match', async () => {
  const interaction = mock<StringSelectMenuInteraction>({
    customId: 'invalid-custom-id',
    deferUpdate: jest.fn().mockReturnValue(Promise.resolve()),
    valueOf: jest.fn(),
  })
  await stringSelectMenuHandler.handle(interaction)
  expect(interaction.deferUpdate).toHaveBeenCalled()
})
