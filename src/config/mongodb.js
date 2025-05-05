
const MONGODB_URI = 'mongodb+srv://tientran:2312@cluster0.7jgv1.mongodb.net/webapi?retryWrites=true&w=majority&appName=Cluster0'


const DATABASE_NAME = 'webapi'

import { MongoClient, ServerApiVersion } from 'mongodb'

let WebApiDatabaseInstance = null

const mongoClient = new MongoClient(MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

export const CONNECT_DB = async () => {
  // gọi kết nối đến mongodbAtlas với uri đã khai báo bên trong mongoclient
  await mongoClient.connect()

  WebApiDatabaseInstance = mongoClient.db(DATABASE_NAME)
}
// function GET_DB (không async) để export ra webapiDatabaseInstance sau khi đã kết nối thành công tới mongodb để tái sử dụng
export const GET_DB = () => {
  if (!WebApiDatabaseInstance) throw new Error('Database not connected')
  return WebApiDatabaseInstance
}