import { ColorResolvable, CommandInteractionOptionResolver, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import Command from '../types/command'
import { getTutoringSessions } from '../util/ical'
import { DateTime } from 'luxon'
import { CLASS_DATA } from '../util/constants'
import { TutoringSession } from '../types/tutoringSession'

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('tutors')
    .setDescription('Lists upcoming tutoring sessions for the day.')
    .addStringOption(option =>
      option
        .setName('class')
        .setDescription('Class to find tutoring sessions for (defaults to all)')
        .setRequired(false)
        .addChoices(
          ...Object.entries(CLASS_DATA).map(([key, value]) => ({
            name: `${key}: ${value.name}`,
            value: key,
          }))
        )
    )
    .addStringOption(option =>
      option
        .setName('date')
        .setDescription('Date to find tutoring sessions for, in format MM/DD/YYYY (defaults to now)')
        .setRequired(false)
    ),

  execute: async interaction => {
    const classNumber = (interaction.options as CommandInteractionOptionResolver).getString('class') as
      | keyof typeof CLASS_DATA
      | undefined

    const dateInput = (interaction.options as CommandInteractionOptionResolver).getString('date')

    const currentTime = dateInput
      ? DateTime.fromFormat(dateInput, 'MM/dd/yyyy', { zone: 'America/Los_Angeles' })
      : DateTime.local({ zone: 'America/Los_Angeles' })

    if (!currentTime.isValid) {
      await interaction.reply({ content: 'Invalid date format. Please use MM/DD/YYYY.', ephemeral: true })
      return
    }

    const events = await getTutoringSessions({
      classNumber,
      start: currentTime.startOf('day'),
      end: currentTime.endOf('day'),
    })

    const embed = new EmbedBuilder()
      .setTitle(`Tutoring Sessions (${classNumber ? `CMSI ${classNumber}` : 'All Classes'})  📚`)
      .setColor(classNumber ? (CLASS_DATA[classNumber].color as ColorResolvable) : '#f09300')
      .setDescription('See [ta.lmucs.com](https://ta.lmucs.com) for the full calendar.')
      .setTimestamp()

    const displayEvents = (events: TutoringSession[], maxEvents = 10) =>
      events
        .slice(0, maxEvents)
        .map(
          event =>
            `• ${event.name} [${event.classNumber}] (${event.start
              .setZone('America/Los_Angeles')
              .toLocaleString(DateTime.TIME_SIMPLE)} - ${event.end.toLocaleString(DateTime.TIME_SIMPLE)})`
        )
        .concat(events.length > maxEvents ? `• (${events.length - maxEvents} more...)` : '')
        .join('\n')

    if (dateInput) {
      embed.addFields({
        name: `Sessions on ${currentTime.toLocaleString(DateTime.DATE_HUGE)}:`,
        value: displayEvents(events) || `No sessions on this day`,
      })
    } else {
      const currentSessions = events.filter(event => event.start <= currentTime && event.end >= currentTime)
      const upcomingSessions = events.filter(event => event.start > currentTime)

      embed.addFields(
        {
          name: 'CURRENT SESSIONS:',
          value: displayEvents(currentSessions) || `No current sessions`,
        },
        {
          name: 'UPCOMING SESSIONS TODAY:',
          value: displayEvents(upcomingSessions) || `No upcoming sessions today`,
        }
      )

      // If there are no current or upcoming sessions today, show the upcoming sessions for the week
      if (currentSessions.length === 0 && upcomingSessions.length === 0) {
        const weekEvents = await getTutoringSessions({
          classNumber,
          start: currentTime.startOf('week'),
          end: currentTime.endOf('week'),
        })
        const weekSessions = weekEvents.filter(event => event.start > currentTime)
        embed.addFields({
          name: 'UPCOMING SESSIONS THIS WEEK:',
          value: displayEvents(weekSessions) || `No upcoming sessions this week`,
        })
      }
    }

    await interaction.reply({ embeds: [embed] })
  },
}

export default command
