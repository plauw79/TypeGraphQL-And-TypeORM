import * as path from 'path'
import * as fs from 'fs'

//## LOGGING DIR WITHOUT BASE DIR ##
export const logDir = path.resolve(
  __dirname,
  process.env.LOGGING_PATH as string
)
fs.existsSync(logDir) || fs.mkdirSync(logDir)

//## BASE UPLOAD DIR ##
export const baseDir = path.resolve(__dirname, process.env.BASE_PATH as string)
fs.existsSync(baseDir) || fs.mkdirSync(baseDir)

//## RECIPE DIR ##
export const recipeDir = path.join(
  (baseDir + process.env.RECIPE_PATH) as string
)
fs.existsSync(recipeDir) || fs.mkdirSync(recipeDir)

//## AVATAR DIR ##
export const avatarDir = path.join(
  (baseDir + process.env.AVATAR_PATH) as string
)
fs.existsSync(avatarDir) || fs.mkdirSync(avatarDir)
