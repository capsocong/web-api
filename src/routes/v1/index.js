import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoutes } from '~/routes/v1/boardRoutes.js'

const Router = express.Router()

Router.route('/status', (req, res) => {
  res.status(StatusCodes.OK).json({ message: 'OK' })
})

Router.use('/boards', boardRoutes)

export const APIs_V1 = Router