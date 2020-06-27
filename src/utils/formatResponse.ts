// import * as chalk from 'chalk'
import chalk from 'chalk'
import { Response } from '../entity/_responseTypes'

var clfDate = require('clf-date')
import logger from '../utils/winstonMorganLogger'

export const formatResponse = (res: Response) => {
  if (res.error) {
    console.log(
      chalk.red(
        `[${chalk.red.bold('!')}] ERROR : [${chalk.green(
          clfDate(new Date())
        )}] [${chalk.yellow(res.id)}]: [PATH] : ${chalk.yellow(
          res.path
        )} || MESSAGE: ${chalk.yellow(res.message)}`
      )
    )

    logger.error(
      `[${clfDate(new Date())}] [ ${res.id} ] : [PATH] : ${
        res.path
      }, [MESSAGE]: ${res.message} ${res.stacktrace}`
    )

    return {
      path: res.path,
      message: res.message,
    }
  }

  console.log(
    chalk.red(
      `[${chalk.yellow('!')}] [${chalk.green(
        clfDate(new Date())
      )}] [PATH] : ${chalk.yellow(res.path)} || MESSAGE: ${chalk.yellow(
        res.message
      )}`
    )
  )

  logger.info(
    `[${clfDate(new Date())}] [PATH] : ${res.path},  [MESSAGE] :  ${
      res.message
    } `
  )

  return {
    path: res.path,
    message: res.message,
  }
}
