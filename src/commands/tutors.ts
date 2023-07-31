import { ColorResolvable, CommandInteractionOptionResolver, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import Command from '../types/command'
import { getTutoringSessions } from '../util/ical'
import { DateTime } from 'luxon'
import { CLASS_DATA } from '../util/constants'

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
    ),

  execute: async interaction => {
    const currentTime = DateTime.now().setZone('America/Los_Angeles')
    const classNumber = (interaction.options as CommandInteractionOptionResolver).getString('class') as
      | keyof typeof CLASS_DATA
      | undefined
    const events = await getTutoringSessions({
      classNumber,
      start: currentTime.startOf('day'),
      end: currentTime.endOf('day'),
    })
    const currentSessions = events.filter(event => event.start <= currentTime && event.end >= currentTime)
    const upcomingSessions = events.filter(event => event.start > currentTime)
    const embed = new EmbedBuilder()
      .setTitle(`Tutoring Sessions (${classNumber ? `CMSI ${classNumber}` : 'All Classes'})  📚`)
      .setColor(classNumber ? (CLASS_DATA[classNumber].color as ColorResolvable) : '#f09300')
      .setDescription('See [ta.lmucs.com](https://ta.lmucs.com) for the full calendar.')
      .addFields(
        {
          name: 'CURRENT SESSIONS:',
          value:
            currentSessions
              .map(
                event =>
                  `• ${event.name} [${event.classNumber}] (${event.start.toLocaleString(
                    DateTime.TIME_SIMPLE
                  )} - ${event.end.toLocaleString(DateTime.TIME_SIMPLE)})`
              )
              .join('\n') || `No current sessions`,
        },
        {
          name: 'UPCOMING SESSIONS TODAY:',
          value:
            upcomingSessions
              .map(
                event =>
                  `• ${event.name} [${event.classNumber}] (${event.start.toLocaleString(
                    DateTime.TIME_SIMPLE
                  )} - ${event.end.toLocaleString(DateTime.TIME_SIMPLE)})`
              )
              .join('\n') || `No upcoming sessions today`,
        }
      )
      .setTimestamp()
    if (currentSessions.length === 0 && upcomingSessions.length === 0) {
      // get all sessions for the week
      const weekEvents = await getTutoringSessions({
        classNumber,
        start: currentTime.startOf('week'),
        end: currentTime.endOf('week'),
      })
      const weekSessions = weekEvents.filter(event => event.start > currentTime)
      embed.addFields({
        name: 'UPCOMING SESSIONS THIS WEEK:',
        value:
          weekSessions
            .slice(0, 5)
            .map(
              event =>
                `• ${event.name} [${event.classNumber}] (${
                  event.start.toLocaleString(DateTime.DATE_HUGE).split(',')[0]
                } ${event.start.toLocaleString(DateTime.TIME_SIMPLE)} - ${event.end.toLocaleString(
                  DateTime.TIME_SIMPLE
                )})`
            )
            .concat(weekSessions.length > 5 ? `• (${weekSessions.length - 5} more...)` : '')
            .join('\n') || `No upcoming sessions this week`,
      })
    }
    await interaction.reply({ embeds: [embed] })
  },
}

export default command
