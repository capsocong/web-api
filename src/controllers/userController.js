
import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/userService'
import ms from 'ms'

const createNew = async (req, res, next) => {
  try {
    const createUser = await userService.createNew(req.body)
    return res.status(StatusCodes.CREATED).json(createUser)
  } catch (error) {next(error)}
}
const verifyAccount = async (req, res, next) => {
  try {
    const result = await userService.verifyAccount(req.body)
    return res.status(StatusCodes.OK).json(result)
  } catch (error) {next(error)}
}
const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body)
    // tra ve http only cookie cho frontend
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('1yad') // 1 day
    })
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14ds') // 14 day
    })
    // console.log('🚀 ~ login ~ login:', result)
    return res.status(StatusCodes.OK).json(result)
  } catch (error) {next(error)}
}
export const userController = {
  createNew,
  verifyAccount,
  login
}