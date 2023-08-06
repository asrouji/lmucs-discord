import { DateTime } from 'luxon'
import { CLASS_DATA } from '../util/constants'

export type TutoringSession = {
  name: string
  classNumber: keyof typeof CLASS_DATA
  start: DateTime
  end: DateTime
}
