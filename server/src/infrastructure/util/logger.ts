import pino from 'pino'
import envs from './environment'

export const logConfig = {
  name: envs.SERVER_NAME!,
  level: envs.LOG_LEVEL ?? 'info',
  messageKey: 'message',
  formatters: {
    level(label: string) {
      return { level: label }
    },
  },
}
const logger = pino(logConfig)

export default logger