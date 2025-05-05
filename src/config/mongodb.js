
import { env } from '~/config/environment'
import { MongoClient, ServerApiVersion } from 'mongodb'
let WebApiDatabaseInstance = null

const mongoClient = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

export const CONNECT_DB = async () => {
  // gọi kết nối đến mongodbAtlas với uri đã khai báo bên trong mongoclient
  await mongoClient.connect()

  WebApiDatabaseInstance = mongoClient.db(env.DATABASE_NAME)
}
// dong ket noi mongodb khi can
export const CLOSE_DB = async () => {
  console.log('Closing MongoDB connection...')
  await mongoClient.close()
}
// function GET_DB (không async) để export ra webapiDatabaseInstance sau khi đã kết nối thành công tới mongodb để tái sử dụng
export const GET_DB = () => {
  if (!WebApiDatabaseInstance) throw new Error('Database not connected')
  return WebApiDatabaseInstance
}