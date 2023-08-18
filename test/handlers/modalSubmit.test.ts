import { GuildMember, GuildMemberRoleManager, ModalSubmitInteraction, RoleResolvable, TextChannel } from 'discord.js'
import modalSubmitInteractionHandler from '../../src/handlers/modalSubmit'
import { MockProxy, mock } from 'jest-mock-extended'

describe('onboarding modal submission', () => {
  const roleManager: MockProxy<GuildMemberRoleManager> = mock<GuildMemberRoleManager>({
    add: jest.fn().mockImplementation((role: RoleResolvable) => {
      if (typeof role === 'string' && role === 'error') {
        throw new Error('Role cannot be added')
      }
    }),
    valueOf: jest.fn(),
  })
  const member: MockProxy<GuildMember> = mock<GuildMember>({
    setNickname: jest.fn(),
    roles: roleManager,
    toString: jest.fn().mockReturnValue('John Doe'),
    valueOf: jest.fn(),
  })
  const role: MockProxy<RoleResolvable> = mock<RoleResolvable>({
    name: 'student',
    toString: jest.fn().mockReturnValue('student'),
    valueOf: jest.fn(),
  })
  const interaction: MockProxy<ModalSubmitInteraction> = mock<ModalSubmitInteraction>({
    customId: 'onboarding-modal-student',
    fields: {
      getTextInputValue: jest.fn().mockImplementation((customId: string) => {
        const sampleFields: Record<string, string> = {
          'onboarding-prompt-full-name': 'John Doe',
        }
        return sampleFields[customId] || ''
      }),
    },
    member: member,
    deferUpdate: jest.fn(),
    valueOf: jest.fn(),
    guild: {
      roles: {
        cache: {
          find: jest.fn().mockReturnValue(role),
        } as never,
        valueOf: jest.fn(),
      },
      channels: {
        cache: {
          find: jest.fn().mockReturnValue({
            send: jest.fn().mockReturnValue(Promise.resolve()),
            isTextBased: jest.fn().mockReturnValue(true),
            valueOf: jest.fn(),
          }),
        } as never,
        valueOf: jest.fn(),
      },
      emojis: {
        cache: {
          find: jest.fn().mockReturnValue({
            toString: jest.fn().mockReturnValue('emoji'),
          }),
        } as never,
        valueOf: jest.fn(),
      },
      valueOf: jest.fn(),
    },
  })

  beforeEach(() => {
    console.error = jest.fn()
    jest.clearAllMocks()
  })

  test("sets the user's nickname and assigns the correct role", async () => {
    await modalSubmitInteractionHandler.handle(interaction)
    expect((interaction.member as GuildMember).setNickname).toHaveBeenCalledWith('John Doe')
    expect(roleManager.add).toHaveBeenCalledWith(role)
  })

  test('logs an error if the nickname cannot be set', async () => {
    ;(interaction.member as GuildMember).setNickname = jest.fn().mockImplementation(() => {
      throw new Error('Nickname cannot be set')
    })
    await modalSubmitInteractionHandler.handle(interaction)
    expect(console.error).toHaveBeenCalled()
    expect(interaction.deferUpdate).toHaveBeenCalled()
  })

  test('fails if interaction.member is null', async () => {
    const member = interaction.member
    interaction.member = null
    await modalSubmitInteractionHandler.handle(interaction)
    expect(console.error).toHaveBeenCalled()
    expect(interaction.deferUpdate).toHaveBeenCalled()
    interaction.member = member
  })

  test('logs an error if the role cannot be added', async () => {
    if (!interaction.guild) {
      throw new Error('interaction.guild is null')
    }
    interaction.guild.roles.cache.find = jest.fn().mockReturnValue('error')
    await modalSubmitInteractionHandler.handle(interaction)
    expect(console.error).toHaveBeenCalled()
    expect(interaction.deferUpdate).toHaveBeenCalled()
  })

  test('logs an error if the role cannot be found', async () => {
    if (!interaction.guild) {
      throw new Error('interaction.guild is null')
    }
    interaction.guild.roles.cache.find = jest.fn().mockReturnValue(undefined)
    await modalSubmitInteractionHandler.handle(interaction)
    expect(console.error).toHaveBeenCalled()
    expect(interaction.deferUpdate).toHaveBeenCalled()
  })

  test('sends a welcome message to #general if the user is a student', async () => {
    if (!interaction.guild) {
      throw new Error('interaction.guild is null')
    }
    await modalSubmitInteractionHandler.handle(interaction)
    expect(interaction.guild.channels.cache.find).toHaveBeenCalled()
    const generalChannel = interaction.guild.channels.cache.find(() => true)
    expect((generalChannel as TextChannel).send).toHaveBeenCalled()
  })

  test('logs an error if the welcome message cannot be sent', async () => {
    if (!interaction.guild) {
      throw new Error('interaction.guild is null')
    }
    // Pretend the general channel is not found
    const generalChannel = interaction.guild.channels.cache.find(() => true)
    ;(interaction.guild.channels.cache.find as jest.Mock).mockReturnValue(undefined)
    await modalSubmitInteractionHandler.handle(interaction)
    expect(console.error).toHaveBeenCalled()
    expect((generalChannel as TextChannel).send).not.toHaveBeenCalled()
  })
})

test('defers the interaction if the customId does not match', async () => {
  const interaction = mock<ModalSubmitInteraction>({
    customId: 'not-onboarding-modal',
    deferUpdate: jest.fn().mockReturnValue(Promise.resolve()),
    valueOf: jest.fn(),
  })
  await modalSubmitInteractionHandler.handle(interaction)
  expect(interaction.deferUpdate).toHaveBeenCalled()
})
