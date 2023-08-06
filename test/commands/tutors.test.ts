import tutorsCommand from '../../src/commands/tutors'
import { CommandInteraction, CommandInteractionOptionResolver, EmbedBuilder } from 'discord.js'
import { mock } from 'jest-mock-extended'
import { DateTime } from 'luxon'
import { TutoringSession } from '../../src/types/tutoringSession'
import { getTutoringSessions } from '../../src/util/ical'
import { DISCORD_EMBED_FIELD_VALUE_LIMIT } from '../../src/util/constants'

jest.mock('../../src/util/ical', () => ({
  // mocking imported module functions: https://stackoverflow.com/a/53402206
  ...jest.requireActual('../../src/util/ical'),
  getTutoringSessions: jest.fn(),
}))

beforeEach(() => {
  jest.clearAllMocks()
})

afterAll(() => {
  jest.restoreAllMocks()
})

test('works when there are no tutoring sessions', async () => {
  // extremely cursed, but it works
  // blame jest for being jank with mocking imported module functions
  ;(
    getTutoringSessions as unknown as { mockResolvedValue: (sessions: TutoringSession[]) => unknown }
  ).mockResolvedValue([])

  const interactionNoDate = mock<CommandInteraction>({
    reply: jest.fn(),
    valueOf: jest.fn(),
    options: mock<CommandInteractionOptionResolver>({
      getString: jest.fn().mockImplementation((key: string) => {
        if (key === 'class') return '1010'
        return undefined
      }),
    }),
  })

  const interactionWithDate = mock<CommandInteraction>({
    reply: jest.fn(),
    valueOf: jest.fn(),
    options: mock<CommandInteractionOptionResolver>({
      getString: jest.fn().mockImplementation((key: string) => {
        if (key === 'class') return '1010'
        if (key === 'date') return '01/01/2021'
        return undefined
      }),
    }),
  })

  for (const interaction of [interactionNoDate, interactionWithDate]) {
    await tutorsCommand.execute(interaction)

    expect(interaction.reply).toHaveBeenCalled()

    const response = interaction.reply.mock.calls[0][0] as { embeds: EmbedBuilder[] }
    const embed = response.embeds[0]

    expect(embed).toBeDefined()

    const embedData = embed.toJSON()
    if (!embedData.fields) throw new Error('embed.fields is undefined')

    // ensure no fields are empty, since that will cause a discord.js error
    for (const field of embedData.fields) {
      expect(field.name).not.toBe('')
      expect(field.value).not.toBe('')
    }
  }
})

test('displays tutoring sessions in the embed', async () => {
  const mockSessions: TutoringSession[] = [
    {
      name: 'Tutor A',
      classNumber: '1010',
      start: DateTime.local(2023, 1, 10, 10, { zone: 'America/Los_Angeles' }),
      end: DateTime.local(2023, 1, 10, 11, { zone: 'America/Los_Angeles' }),
    },
    {
      name: 'Tutor B',
      classNumber: '1010',
      start: DateTime.local(2023, 1, 10, 12, { zone: 'America/Los_Angeles' }),
      end: DateTime.local(2023, 1, 10, 14, { zone: 'America/Los_Angeles' }),
    },
    {
      name: 'Tutor C',
      classNumber: '1010',
      start: DateTime.local(2023, 1, 10, 13, { zone: 'America/Los_Angeles' }),
      end: DateTime.local(2023, 1, 10, 16, { zone: 'America/Los_Angeles' }),
    },
  ]

  ;(
    getTutoringSessions as unknown as { mockResolvedValue: (sessions: TutoringSession[]) => unknown }
  ).mockResolvedValue(mockSessions)

  const interaction = mock<CommandInteraction>({
    reply: jest.fn(),
    valueOf: jest.fn(),
    options: mock<CommandInteractionOptionResolver>({
      getString: jest.fn().mockImplementation((key: string) => {
        if (key === 'date') return '10/05/2023'
        if (key === 'class') return '1010'
        return undefined
      }),
    }),
  })

  await tutorsCommand.execute(interaction)

  expect(interaction.reply).toHaveBeenCalled()

  const response = interaction.reply.mock.calls[0][0] as { embeds: EmbedBuilder[] }
  const embed = response.embeds[0]
  expect(embed).toBeDefined()

  const embedData = embed.toJSON()
  if (!embedData.fields) throw new Error('embed.fields is undefined')

  const tutorsOutput = embedData.fields[0].value

  expect(tutorsOutput).toContain('Tutor A')
  expect(tutorsOutput).toContain('Tutor B')
  expect(tutorsOutput).toContain('Tutor C')

  expect(tutorsOutput).toContain('10:00 AM - 11:00 AM')
  expect(tutorsOutput).toContain('12:00 PM - 2:00 PM')
  expect(tutorsOutput).toContain('1:00 PM - 4:00 PM')
})

test('replies with an error if the date is invalid', async () => {
  const interaction = mock<CommandInteraction>({
    reply: jest.fn(),
    valueOf: jest.fn(),
    options: mock<CommandInteractionOptionResolver>({
      getString: jest.fn().mockImplementation((key: string) => {
        if (key === 'date') return 'invalid date'
        return undefined
      }),
    }),
  })

  await tutorsCommand.execute(interaction)

  expect(interaction.reply).toHaveBeenCalled()

  const response = interaction.reply.mock.calls[0][0] as { content: string }
  expect(response.content).toContain('Invalid date')
})

test('shows current and upcoming sessions when no date input is given', async () => {
  const mockSessions: TutoringSession[] = [
    {
      // current session
      name: 'Tutor A',
      classNumber: '1010',
      start: DateTime.local({ zone: 'America/Los_Angeles' }).minus({ minutes: 30 }),
      end: DateTime.local({ zone: 'America/Los_Angeles' }).plus({ minutes: 30 }),
    },
    {
      // upcoming session
      name: 'Tutor B',
      classNumber: '1010',
      start: DateTime.local({ zone: 'America/Los_Angeles' }).plus({ minutes: 30 }),
      end: DateTime.local({ zone: 'America/Los_Angeles' }).plus({ minutes: 90 }),
    },
  ]

  ;(
    getTutoringSessions as unknown as { mockResolvedValue: (sessions: TutoringSession[]) => unknown }
  ).mockResolvedValue(mockSessions)

  const interaction = mock<CommandInteraction>({
    reply: jest.fn(),
    valueOf: jest.fn(),
    options: mock<CommandInteractionOptionResolver>({
      getString: jest.fn().mockImplementation(() => undefined),
    }),
  })

  await tutorsCommand.execute(interaction)

  expect(interaction.reply).toHaveBeenCalled()

  const response = interaction.reply.mock.calls[0][0] as { embeds: EmbedBuilder[] }
  const embed = response.embeds[0]
  expect(embed).toBeDefined()

  const embedData = embed.toJSON()
  if (!embedData.fields) throw new Error('embed.fields is undefined')

  const currentSessions = embedData.fields[0].value
  const upcomingSessions = embedData.fields[1].value

  expect(currentSessions).toBeDefined()
  expect(upcomingSessions).toBeDefined()

  expect(currentSessions).toContain('Tutor A')
  expect(currentSessions).not.toContain('Tutor B')

  expect(upcomingSessions).toContain('Tutor B')
  expect(upcomingSessions).not.toContain('Tutor A')
})

test('shows upcoming sessions for the week if no sessions today', async () => {
  // first query for tutoring sessions returns no sessions today
  ;(
    getTutoringSessions as unknown as { mockResolvedValueOnce: (sessions: TutoringSession[]) => unknown }
  ).mockResolvedValueOnce([])

  const mockSessions: TutoringSession[] = [
    {
      // upcoming session
      name: 'Tutor A',
      classNumber: '1010',
      start: DateTime.local({ zone: 'America/Los_Angeles' }).plus({ days: 1 }),
      end: DateTime.local({ zone: 'America/Los_Angeles' }).plus({ days: 1, minutes: 30 }),
    },
  ]

  // second query for tutoring sessions returns sessions for the week
  ;(
    getTutoringSessions as unknown as { mockResolvedValueOnce: (sessions: TutoringSession[]) => unknown }
  ).mockResolvedValueOnce(mockSessions)

  const interaction = mock<CommandInteraction>({
    reply: jest.fn(),
    valueOf: jest.fn(),
    options: mock<CommandInteractionOptionResolver>({
      getString: jest.fn().mockImplementation(() => undefined),
    }),
  })

  await tutorsCommand.execute(interaction)

  expect(interaction.reply).toHaveBeenCalled()

  const response = interaction.reply.mock.calls[0][0] as { embeds: EmbedBuilder[] }
  const embed = response.embeds[0]
  expect(embed).toBeDefined()

  const embedData = embed.toJSON()
  if (!embedData.fields) throw new Error('embed.fields is undefined')

  const currentSessions = embedData.fields[0].value
  const upcomingSessionsToday = embedData.fields[1].value
  const upcomingSessionsThisWeek = embedData.fields[2].value

  expect(currentSessions).not.toContain('Tutor A')
  expect(upcomingSessionsToday).not.toContain('Tutor A')
  expect(upcomingSessionsThisWeek).toContain('Tutor A')
})

test('truncates the output if there are too many sessions', async () => {
  const session: TutoringSession = {
    name: 'Tutor A',
    classNumber: '1010',
    start: DateTime.local({ zone: 'America/Los_Angeles' }).minus({ minutes: 30 }),
    end: DateTime.local({ zone: 'America/Los_Angeles' }).plus({ minutes: 30 }),
  }

  const mockSessions: TutoringSession[] = []
  // add a bunch of sessions
  for (let i = 0; i < 50; i++) {
    mockSessions.push(session)
  }

  ;(
    getTutoringSessions as unknown as { mockResolvedValue: (sessions: TutoringSession[]) => unknown }
  ).mockResolvedValue(mockSessions)

  const interaction = mock<CommandInteraction>({
    reply: jest.fn(),
    valueOf: jest.fn(),
    options: mock<CommandInteractionOptionResolver>({
      getString: jest.fn().mockImplementation(() => undefined),
    }),
  })

  await tutorsCommand.execute(interaction)
  expect(interaction.reply).toHaveBeenCalled()

  const response = interaction.reply.mock.calls[0][0] as { embeds: EmbedBuilder[] }
  const embed = response.embeds[0]
  expect(embed).toBeDefined()

  const embedData = embed.toJSON()
  if (!embedData.fields) throw new Error('embed.fields is undefined')
  const currentSessions = embedData.fields[0].value
  const upcomingSessions = embedData.fields[1].value

  // make sure each field is less than the discord embed field value limit
  expect(currentSessions.length).toBeLessThan(DISCORD_EMBED_FIELD_VALUE_LIMIT)
  expect(upcomingSessions.length).toBeLessThan(DISCORD_EMBED_FIELD_VALUE_LIMIT)
})
