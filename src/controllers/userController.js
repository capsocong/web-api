
import { StatusCodes } from 'http-status-codes'
import { userService } from '~/services/userService'
import ms from 'ms'
import ApiError from '~/utils/ApiError'

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
      maxAge: ms('1d') // 1 day
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
const logout = async (req, res, next) => {
  try {
    // xóa cookie accessToken và refreshToken
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    return res.status(StatusCodes.OK).json({ messageSuccess: true })
  } catch (error) {next(error)}
}
const refreshToken = async (req, res, next) => {
  try {
    const result = await userService.refreshToken(req.cookies?.refreshToken)
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14d') // 1 day
    })
    return res.status(StatusCodes.OK).json(result)
  } catch (error) {
    return next(new ApiError(StatusCodes.FORBIDDEN, 'Please sign in again!(error in refreshToken)'))
  }
}
const update = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const userAvatarFile = req.file
    console.log('🚀 ~ update ~ userAvatarFile:', userAvatarFile)
    const updatedUser = await userService.update(userId, req.body, userAvatarFile)
    res.status(StatusCodes.OK).json(updatedUser)
  } catch (error) {
    next(error)
  }
}

export const userController = {
  createNew,
  verifyAccount,
  login,
  logout,
  refreshToken,
  update
}