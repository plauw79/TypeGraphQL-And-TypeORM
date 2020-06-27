import * as path from 'path'
import { logDir } from '../helpers/dirExist'

var clfDate = require('clf-date')
var winston = require('winston')
import 'winston-daily-rotate-file'

// import * as winston from 'winston'
// require('winston-daily-rotate-file')

const productionFormat = winston.format.combine(
  // winston.format.timestamp(),
  winston.format.align()
  // winston.format.printf(formatParams)
)

var infofile = new winston.transports.DailyRotateFile({
  level: 'info',
  filename: path.resolve(logDir, 'WinstonInfo-%DATE%.log'),
  datePattern: 'DD-MM-YYYY--HH:MM',
  zippedArchive: true,
  maxSize: '100m',
  maxFiles: '30d', // keep logs for 30 days
})

var errorfile = new winston.transports.DailyRotateFile({
  level: 'error',
  filename: path.resolve(logDir, 'WinstonError-%DATE%.log'),
  format: productionFormat,
  datePattern: 'DD-MM-YYYY--HH:MM',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d', // keep logs for 30 days
})

const logger = winston.createLogger({
  transports: [infofile, errorfile],
  exitOnError: false, // do not exit on handled exceptions
})

logger.stream = {
  write: function (message: any, _encoding: any) {
    // use the 'info' log level so the output will be picked up by both transports
    logger.info(message)
  },
}

logger.combinedFormat = function (err: any, req: any, _res: any) {
  return `${req.ip} - - [${clfDate(new Date())}] \"${req.method} ${
    req.originalUrl
  } HTTP/${req.httpVersion}\" ${err.status || 500} - ${
    req.headers['user-agent']
  }`
}

// infofile.on('rotate', function(oldFilename, newFilename) {
//   // do something fun
// })
// errorfile.on('rotate', function(oldFilename, newFilename) {
//   // do something fun
// })

export default logger
