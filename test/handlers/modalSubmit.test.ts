import { GuildMember, ModalSubmitInteraction } from 'discord.js'
import modalSubmitInteractionHandler from '../../src/handlers/modalSubmit'
import { mock } from 'jest-mock-extended'

describe('onboarding modal submission', () => {
  const interaction = mock<ModalSubmitInteraction>({
    customId: 'onboarding-modal',
    fields: {
      getTextInputValue: jest.fn().mockImplementation((customId: string) => {
        const sampleFields: Record<string, string> = {
          'onboarding-prompt-full-name': 'John Doe',
        }
        return sampleFields[customId] || ''
      }),
    },
    member: jest.fn().mockImplementation(() => {
      // we define the mock member this way so it is recognized as an instanceof GuildMember
      const member = Object.create(GuildMember.prototype)
      member.setNickname = jest.fn()
      return member
    })(),
    deferUpdate: jest.fn(),
    valueOf: jest.fn(),
  })

  beforeAll(() => {
    console.error = jest.fn()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("sets the user's nickname to their full name", async () => {
    await modalSubmitInteractionHandler.handle(interaction)
    expect((interaction.member as GuildMember).setNickname).toHaveBeenCalledWith('John Doe')
  })

  test('responds to the interaction', async () => {
    await modalSubmitInteractionHandler.handle(interaction)
    expect(interaction.deferUpdate).toHaveBeenCalled()
  })

  test('logs an error if the nickname cannot be set', async () => {
    ;(interaction.member as GuildMember).setNickname = jest.fn().mockImplementation(() => {
      throw new Error('Nickname cannot be set')
    })
    await modalSubmitInteractionHandler.handle(interaction)
    expect(console.error).toHaveBeenCalled()
    expect(interaction.deferUpdate).toHaveBeenCalled()
  })

  test('fails if interaction.member is not a GuildMember', async () => {
    interaction.member = null
    await modalSubmitInteractionHandler.handle(interaction)
    expect(console.error).toHaveBeenCalled()
    expect(interaction.deferUpdate).toHaveBeenCalled()
  })
})

test('defers the interaction if the customId does not match', async () => {
  const interaction = mock<ModalSubmitInteraction>({
    customId: 'not-onboarding-modal',
    deferUpdate: jest.fn(),
    valueOf: jest.fn(),
  })
  await modalSubmitInteractionHandler.handle(interaction)
  expect(interaction.deferUpdate).toHaveBeenCalled()
})
