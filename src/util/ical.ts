// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ICalExpander from 'ical-expander'
import { DateTime } from 'luxon'
import { CALENDAR_URLS, CLASS_DATA } from './constants'

const fetchCalendar = async (url: string) => {
  const response = await fetch(url)
  const ics = await response.text()
  return new ICalExpander({ ics, maxIterations: 100 })
}

const getCalendarEvents = async (url: string, from: DateTime, to: DateTime) => {
  const icalExpander = await fetchCalendar(url)
  const events = icalExpander.between(from.toUTC().toJSDate(), to.toUTC().toJSDate())
  const mappedEvents = events.events.map(
    (e: { startDate: { toJSDate: () => Date }; endDate: { toJSDate: () => Date }; summary: string }) => ({
      star: DateTime.fromJSDate(e.startDate.toJSDate()),
      end: DateTime.fromJSDate(e.endDate.toJSDate()),
      summary: e.summary,
    })
  )
  const mappedOccurrences = events.occurrences.map(
    (o: { startDate: { toJSDate: () => Date }; endDate: { toJSDate: () => Date }; item: { summary: string } }) => ({
      start: DateTime.fromJSDate(o.startDate.toJSDate()),
      end: DateTime.fromJSDate(o.endDate.toJSDate()),
      summary: o.item.summary,
    })
  )
  return [...mappedEvents, ...mappedOccurrences] as {
    start: DateTime
    end: DateTime
    summary: string
  }[]
}

export const getTutoringSessions = async (options: {
  classNumber?: keyof typeof CLASS_DATA
  start: DateTime
  end: DateTime
}) => {
  let events: { start: DateTime; end: DateTime; summary: string }[]
  if (options?.classNumber) {
    events = await getCalendarEvents(CLASS_DATA[options.classNumber].url, options.start, options.end)
  } else {
    events = await Promise.all(CALENDAR_URLS.map(url => getCalendarEvents(url, options.start, options.end))).then(
      events => events.flat()
    )
  }
  return events
    .map(event => {
      const classStartIndex = event.summary.indexOf('(') + 1
      return {
        name: event.summary.slice(0, classStartIndex - 1).trim(),
        classNumber: event.summary.slice(
          classStartIndex,
          event.summary.indexOf(' ', classStartIndex)
        ) as keyof typeof CLASS_DATA,
        start: event.start,
        end: event.end,
      }
    })
    .filter(
      event => !options.classNumber || options.classNumber === '2130' || event.classNumber === options.classNumber
    )
    .sort((a, b) => a.start?.toMillis() - b.start?.toMillis())
}
