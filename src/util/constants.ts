import dotenv from 'dotenv'
dotenv.config()

export const DISCORD_EMBED_FIELD_VALUE_LIMIT = 1024

const CLASS_1010_URL = process.env.CLASS_1010_URL || ''

const CLASS_2120_URL = process.env.CLASS_2120_URL || ''

const CLASS_GENERAL_URL = process.env.CLASS_GENERAL_URL || ''

export const CALENDAR_URLS = [CLASS_1010_URL, CLASS_2120_URL, CLASS_GENERAL_URL]

export const CLASS_DATA = {
  '1010': {
    url: CLASS_1010_URL,
    name: 'Computer Programming',
    color: '#328a49',
  },
  '2120': {
    url: CLASS_2120_URL,
    name: 'Data Structures',
    color: '#832b94',
  },
  '2130': {
    url: CLASS_2120_URL,
    name: 'Algorithms',
    color: '#832b94',
  },
  '2210': {
    url: CLASS_GENERAL_URL,
    name: 'Computer Systems Organization',
    color: '#5476d0',
  },
  '2021': {
    url: CLASS_GENERAL_URL,
    name: 'Web Application Development',
    color: '#5476d0',
  },
  '2022': {
    url: CLASS_GENERAL_URL,
    name: 'Mobile Application Development',
    color: '#5476d0',
  },
  '3801': {
    url: CLASS_GENERAL_URL,
    name: 'Languages & Automata I',
    color: '#5476d0',
  },
  '3802': {
    url: CLASS_GENERAL_URL,
    name: 'Languages & Automata II',
    color: '#5476d0',
  },
  '3300': {
    url: CLASS_GENERAL_URL,
    name: 'Artificial Intelligence',
    color: '#5476d0',
  },
  '4320': {
    url: CLASS_GENERAL_URL,
    name: 'Cognitive Systems Design',
    color: '#5476d0',
  },
}

export const WELCOME_MESSAGES = [
  'Welcome {user} to the server!',
  '{user} just showed up!',
  '{user} is here.',
  'Everyone welcome {user}!',
  '{user} just landed.',
  '{user} joined the party.',
  '{user} just slid into the server.',
  "Glad you're here, {user}.",
  'Yay you made it, {user}!',
  'Welcome {user}!',
  '{user} hopped into the server.',
  '{user} just joined. Everyone, look busy!',
  '{user} is here, as the prophecy foretold.',
  "Welcome, {user}! We're so happy you're here.",
  'The wait is over, {user} has finally arrived!',
  'Gather round everyone - {user} is here!',
  'The one and only {user} is here! Thanks for joining!',
  '{user} has joined! _happy dance_',
  '{user} has arrived!',
  'Salutations, {user}!',
]
