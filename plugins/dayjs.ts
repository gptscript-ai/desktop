import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import isToday from 'dayjs/plugin/isToday'

declare global {
  interface Window {
    dayjs: typeof dayjs
  }
}

export default defineNuxtPlugin(() => {
  dayjs.extend(utc)
  dayjs.extend(timezone)
  dayjs.extend(isToday)
  window.dayjs = dayjs
})
