import { Request } from 'express'
import { getFiles, getNameFromFullname, handleUploadImage, handleUploadVideo } from '~/utils/file'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import path from 'path'
import fs from 'fs'
import fsPromise from 'fs/promises'
import { config } from 'dotenv'
import { isProduction } from '~/constants/config'
import { Media } from '~/models/Other'
import { EncodingStatus, MediaType } from '~/constants/enums'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import databaseService from './database.services'
import VideoStatus from '~/models/schemas/VideoStatus..schema'
import { uploadFileToS3 } from '~/utils/s3'
import mime from 'mime'
import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3'
import { rimrafSync } from 'rimraf'

config()

class Queue {
  items: string[]
  encoding: boolean
  constructor() {
    this.items = []
    this.encoding = false
  }
  async enqueue(item: string) {
    this.items.push(item)
    // item = /home/User/Downloads/123/abc.mp4
    const idName = getNameFromFullname(item.split('/').pop() as string)
    console.log('item', item)
    console.log('idName', idName)

    await databaseService.videoStatus.insertOne(
      new VideoStatus({
        name: idName,
        status: EncodingStatus.Pending
      })
    )
    this.processEncode()
  }

  async processEncode() {
    if (this.encoding) return
    if (this.items.length > 0) {
      this.encoding = true

      const videoPath = this.items[0]
      const idName = getNameFromFullname(videoPath.split('/').pop() as string)
      await databaseService.videoStatus.updateOne(
        {
          name: idName
        },
        {
          $set: {
            status: EncodingStatus.Processing
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
      try {
        await encodeHLSWithMultipleVideoStreams(videoPath)
        this.items.shift()

        // await fsPromise.unlink(videoPath)
        const files = getFiles(path.resolve(UPLOAD_VIDEO_DIR, idName))
        await Promise.all(
          files.map((filepath) => {
            // filepath: D:\Projects\twitter-clone\uploads\videos\gFX6udKbfnEnzAwQUO4wq\v0\fileSequence0.ts
            const filename = 'videos-hls' + filepath.replace(path.resolve(UPLOAD_VIDEO_DIR), '')
            return uploadFileToS3({
              filepath,
              filename,
              contentType: mime.getType(filepath) as string
            })
          })
        )
        rimrafSync(path.resolve(UPLOAD_VIDEO_DIR, idName))
        await databaseService.videoStatus.updateOne(
          {
            name: idName
          },
          {
            $set: {
              status: EncodingStatus.Success
            },
            $currentDate: {
              updated_at: true
            }
          }
        )
        console.log(`Encode video ${videoPath} success`)
      } catch (error) {
        await databaseService.videoStatus
          .updateOne(
            {
              name: idName
            },
            {
              $set: {
                status: EncodingStatus.Failed
              },
              $currentDate: {
                updated_at: true
              }
            }
          )
          .catch((err) => {
            console.error('Update video status error', err)
          })
        console.error(`Encode video ${videoPath} error`)
        console.error(error)
      }
      this.encoding = false
      this.processEncode()
    } else {
      console.log('Encode video queue is empty')
    }
  }
}

const queue = new Queue()

class MediasService {
  async uploadImage(req: Request) {
    const files = await handleUploadImage(req)
    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullname(file.newFilename)
        const newFullFilename = `${newName}.jpg`
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, newFullFilename)

        // console.log('newName', newName)
        // console.log('newFullFilename', newFullFilename)
        // console.log('newPath', newPath)

        await sharp(file.filepath).jpeg().toFile(newPath)

        const s3Result = await uploadFileToS3({
          filename: 'images/' + newFullFilename,
          filepath: newPath,
          contentType: mime.getType(newPath) as string
        })
        await Promise.all([fsPromise.unlink(file.filepath), fsPromise.unlink(newPath)])
        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.Image
        }
        // return {
        //   url: isProduction
        //     ? `${process.env.HOST}/static/image/${newName}.jpg`
        //     : `http://localhost:${process.env.PORT}/static/image/${newName}.jpg`,
        //   type: MediaType.Image
        // }
      })
    )
    return result
  }

  async uploadVideo(req: Request) {
    const files = await handleUploadVideo(req)

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const s3Result = await uploadFileToS3({
          filename: 'videos/' + file.newFilename,
          contentType: mime.getType(file.filepath) as string,
          filepath: file.filepath
        })
        fsPromise.unlink(file.filepath)
        return {
          url: (s3Result as CompleteMultipartUploadCommandOutput).Location as string,
          type: MediaType.Video
        }
        // return {
        //   url: isProduction
        //     ? `${process.env.HOST}/static/video/${file.newFilename}`
        //     : `http://localhost:${process.env.PORT}/static/video/${file.newFilename}`,
        //   type: MediaType.Video
        // }
      })
    )
    return result
  }

  async uploadVideoHLS(req: Request) {
    const files = await handleUploadVideo(req)

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        // await encodeHLSWithMultipleVideoStreams(file.filepath)
        const newName = getNameFromFullname(file.newFilename)
        // await fsPromise.unlink(file.filepath)
        queue.enqueue(file.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/static/video-hls/${newName}/master.m3u8`
            : `http://localhost:${process.env.PORT}/static/video-hls/${newName}/master.m3u8`,
          type: MediaType.HLS
        }
      })
    )
    return result
  }
  async getVideoStatus(id: string) {
    const data = await databaseService.videoStatus.findOne({ name: id })
    return data
  }
}

const mediasService = new MediasService()

export default mediasService
