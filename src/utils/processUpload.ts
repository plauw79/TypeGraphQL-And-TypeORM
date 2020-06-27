import shortid from 'shortid'
import * as fs from 'fs'
import { Upload } from '../types/upload'
// import { baseDir } from '../helpers/dirExist'

const storeUpload = async (
  createReadStream: any,
  // mimetype: string,
  uploadDir: string,
  filename: string
): Promise<any> => {
  // const extension = mimetype.split('/')[1]
  // const id = `${shortid.generate()}.${filename}.${extension}`
  const id = `${shortid.generate()}.${filename}`

  const path = uploadDir + `${id}`

  return new Promise((resolve, reject) =>
    createReadStream()
      .pipe(fs.createWriteStream(path))
      .on('finish', () => resolve({ id, path }))
      .on('error', reject)
  )
}

export const processUpload = async (uploadDir: string, upload: Upload) => {
  // const { createReadStream, mimetype, filename } = await upload
  // const { id } = await storeUpload(createReadStream, mimetype, filename)
  // return id

  const { createReadStream, filename } = await upload
  const { id } = await storeUpload(createReadStream, uploadDir, filename)
  return id
}
