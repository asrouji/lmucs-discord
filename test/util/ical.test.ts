import { CLASS_DATA, CALENDAR_URLS } from '../../src/util/constants'
import { DateTime, Settings } from 'luxon'
import { getTutoringSessions } from '../../src/util/ical'
import path from 'path'

let original_1010_url: string
let original_2120_url: string
let original_general_url: string

beforeAll(() => {
  original_1010_url = CALENDAR_URLS[0]
  original_2120_url = CALENDAR_URLS[1]
  original_general_url = CALENDAR_URLS[2]

  CALENDAR_URLS[0] = `${path.join(__dirname, '../../data/sample_1010.ics')}`
  CALENDAR_URLS[1] = `${path.join(__dirname, '../../data/sample_2120.ics')}`
  CALENDAR_URLS[2] = `${path.join(__dirname, '../../data/sample_general.ics')}`

  CLASS_DATA['1010'].url = `${path.join(__dirname, '../../data/sample_1010.ics')}`
  CLASS_DATA['2120'].url = `${path.join(__dirname, '../../data/sample_2120.ics')}`
})

afterAll(() => {
  CALENDAR_URLS[0] = original_1010_url
  CALENDAR_URLS[1] = original_2120_url
  CALENDAR_URLS[2] = original_general_url

  CLASS_DATA['1010'].url = original_1010_url
  CLASS_DATA['2120'].url = original_2120_url
})

test('gets tutoring sessions for all classes by default', async () => {
  const sessions = await getTutoringSessions({
    start: DateTime.fromObject({ year: 2023, month: 7, day: 1 }, { zone: 'America/Los_Angeles' }).startOf('day'),
    end: DateTime.fromObject({ year: 2023, month: 8, day: 31 }, { zone: 'America/Los_Angeles' }).endOf('day'),
  })

  expect(sessions.filter(s => s.name === 'Tutor A')).toHaveLength(16) // 1010 TA
  expect(sessions.filter(s => s.name === 'Tutor B')).toHaveLength(15) // 1010 TA
  expect(sessions.filter(s => s.name === 'Tutor C')).toHaveLength(15) // 2120 TA
})

test('gets all tutoring sessions for the specified class', async () => {
  const sessions = await getTutoringSessions({
    classNumber: '1010',
    start: DateTime.fromObject({ year: 2023, month: 7, day: 1 }, { zone: 'America/Los_Angeles' }).startOf('day'),
    end: DateTime.fromObject({ year: 2023, month: 8, day: 31 }, { zone: 'America/Los_Angeles' }).endOf('day'),
  })

  // all sessions should be for class 1010
  expect(sessions.filter(s => s.classNumber !== '1010')).toHaveLength(0)

  // there should be 16 sessions for tutor A and 15 for tutor B in this time period
  expect(sessions.filter(s => s.name === 'Tutor A')).toHaveLength(16)
  expect(sessions.filter(s => s.name === 'Tutor B')).toHaveLength(15)
})

test('filters out sessions that are not in the specified time period', async () => {
  const sessions = await getTutoringSessions({
    start: DateTime.fromObject({ year: 2023, month: 7, day: 17 }, { zone: 'America/Los_Angeles' }).startOf('day'),
    end: DateTime.fromObject({ year: 2023, month: 7, day: 20 }, { zone: 'America/Los_Angeles' }).endOf('day'),
  })

  // there should be 4 sessions for tutor A and 4 for tutor B in this time period
  expect(sessions.filter(s => s.name === 'Tutor A')).toHaveLength(2)
  expect(sessions.filter(s => s.name === 'Tutor B')).toHaveLength(3)
})

test('returns the correct time regardless of host time zone', async () => {
  const zone = Settings.defaultZone

  // set the host time zone to something other than America/Los_Angeles to make sure the returned times are still in LA time
  Settings.defaultZone = 'UTC'

  const sessions = await getTutoringSessions({
    start: DateTime.fromObject({ year: 2023, month: 7, day: 17 }, { zone: 'America/Los_Angeles' }).startOf('day'),
    end: DateTime.fromObject({ year: 2023, month: 7, day: 20 }, { zone: 'America/Los_Angeles' }).endOf('day'),
  })

  console.log(sessions.map(s => `${s.name} ${s.start.hour}:${s.start.minute} - ${s.end.hour}:${s.end.minute}`))

  // tutor A's sessions should start at 10:00 AM and end at 11:30 AM
  expect(sessions.filter(s => s.name === 'Tutor A')[0].start.toFormat('HH:mm')).toBe('10:00')
  expect(sessions.filter(s => s.name === 'Tutor A')[0].end.toFormat('HH:mm')).toBe('11:30')

  // tutor B's sessions should start at 5:00 PM and end at 6:30 PM
  expect(sessions.filter(s => s.name === 'Tutor B')[0].start.toFormat('HH:mm')).toBe('17:00')
  expect(sessions.filter(s => s.name === 'Tutor B')[0].end.toFormat('HH:mm')).toBe('18:30')

  Settings.defaultZone = zone
})
