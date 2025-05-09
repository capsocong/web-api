/* eslint-disable no-console */

import express from 'express'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, GET_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1/index.js'
import { corsOptions } from './config/cors'
import cors from 'cors'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
const START_SERVER = () => {
  const app = express()
  app.use(cors(corsOptions))

  app.use(express.json())

  app.use('/v1', APIs_V1)

  // middleware xử lý lỗi tập trung
  app.use((err, req, res, next) => {
    errorHandlingMiddleware(err, req, res, next)
  })
  app.get('/', async (req, res) => {
    // console.log(await GET_DB().listCollections().toArray())
    res.end('<h1>Hello World! tien dep trai qua</h1><hr>')
  })

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    // eslint-disable-next-line no-console
    console.log(`server running at http://${env.APP_PORT}:${env.APP_HOST}/`)
  })

  exitHook(() => {
    console.log('server shutting down...')
    CLOSE_DB()
    console.log('MongoDB connection closed')
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

