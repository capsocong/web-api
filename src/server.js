/* eslint-disable no-console */

import express from 'express'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, GET_DB } from '~/config/mongodb'

const START_SERVER = () => {
  const app = express()
  const hostname = 'localhost'
  const port = 8017

  app.get('/', async (req, res) => {
    console.log(await GET_DB().listCollections().toArray())
    res.end('<h1>Hello World!</h1><hr>')
  })

  app.listen(port, hostname, () => {
    // eslint-disable-next-line no-console
    console.log(`server running at http://${hostname}:${port}/`)
  })

  exitHook(() => {
    console.log('4 exitapp')
  })
}
(async () => {
  try {
    console.log('1.Connecting to MongoDB Atlas')
    await CONNECT_DB()
    console.log('2.Connected to MongoDB Atlas')
    // start server khi kết nối thành công
    console.log('3.Starting server')
    START_SERVER()
  } catch (error) {
    console.log(error)
    process.exit(0)
  }
})()
// CONNECT_DB()
//   .then(() => {
//     console.log('Connected to MongoDB Atlas')
//   })
//   .then( () => { START_SERVER() } )

//   .catch( error => {
//     console.error('Error connecting to MongoDB Atlas:', error)
//     process.exit(0)
//   })

