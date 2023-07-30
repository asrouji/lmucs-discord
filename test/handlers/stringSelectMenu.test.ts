import { StringSelectMenuInteraction } from 'discord.js'
import { mock } from 'jest-mock-extended'
import stringSelectMenuHandler from '../../src/handlers/stringSelectMenu'

describe('onboarding role selection', () => {
  test('shows the onboarding modal on selection', async () => {
    const interaction = mock<StringSelectMenuInteraction>({
      customId: 'onboarding-role-select',
      valueOf: jest.fn(),
      showModal: jest.fn(),
    })

    await stringSelectMenuHandler.handle(interaction)

    expect(interaction.showModal).toHaveBeenCalled()
  })
})

test('defers the interaction if the customId does not match', async () => {
  const interaction = mock<StringSelectMenuInteraction>({
    customId: 'invalid-custom-id',
    deferUpdate: jest.fn(),
    valueOf: jest.fn(),
  })
  await stringSelectMenuHandler.handle(interaction)
  expect(interaction.deferUpdate).toHaveBeenCalled()
})
