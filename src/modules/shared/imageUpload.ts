import { Resolver, Mutation, Arg } from 'type-graphql'
import { GraphQLUpload } from 'graphql-upload'
import { createWriteStream } from 'fs'

import { Upload } from '../../types/upload'

@Resolver()
export class ImageResolver {
  @Mutation(() => Boolean)
  async imageUpload(
    @Arg('image', () => GraphQLUpload)
    { createReadStream, filename }: Upload
  ): Promise<boolean> {
    return new Promise(async (resolve, reject) =>
      createReadStream()
        .pipe(createWriteStream(__dirname + `/../../../images/${filename}`))
        .on('finish', () => resolve(true))
        .on('error', () => reject(false))
    )
  }
}
