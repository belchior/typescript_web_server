import pino from 'pino'
import envs from './environment'

const logger = pino({
  name: envs.SERVER_NAME!,
  formatters: {
    level(label) {
      return { level: label }
    },
  },
})

export default logger