import dotenv from 'dotenv'
import request from 'request'
import { WebClient, LogLevel } from '@slack/web-api'
import fs from 'fs'

// make it possible to load env variables from .env file
dotenv.config()

const client = new WebClient(process.env.SLACK_BOT_TOKEN, {
  logLevel: LogLevel.WARN,
})

const download = async (url: string, dest: string) => {
  /* Create an empty file where we can save data */
  const file = fs.createWriteStream(dest)

  /* Using Promises so that we can use the ASYNC AWAIT syntax */
  await new Promise((resolve, reject) => {
    request({
      /* Here you should specify the exact link to the file you are trying to download */
      uri: url,
      gzip: true,
    })
      .pipe(file)
      .on('finish', async (result) => {
        console.log(`The file is finished downloading.`)
        resolve(result)
      })
      .on('error', (error) => {
        reject(error)
      })
  }).catch((error) => {
    console.log(`Something happened: ${error}`)
  })
}

const main = async () => {
  const res = await client.emoji.list()
  for (const key in res.emoji) {
    const url = res.emoji[key]
    if (url.match(/alias/)) {
      continue
    }

    const extension = url.match(/\.[^\.]+$/)
    await download(url, './images/' + key + extension)
  }
}

;(async () => {
  try {
    await main()
  } catch (error) {
    console.error('error', error)
    console.log('何らかのエラーが発生しました。')
  }
})()
