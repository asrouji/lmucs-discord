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
