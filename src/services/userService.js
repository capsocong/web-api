import { WEBSITE_DOMAIN } from '~/utils/constants'
import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUserFields } from '~/utils/formatters'
import { BrevoProvider } from '~/providers/BrevoProvider'
// import { NodemailerProvider } from '~/providers/NodeMailer'
import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/JwtProvider'

import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

const createNew = async (reqBody) => {
  try {
    // kiem tra xem email da ton tai chua
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (existUser) { throw new ApiError(StatusCodes.CONFLICT, 'Email already exists')}
    // tao data de luu vao db
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      password: bcrypt.hashSync(reqBody.password, 8), // tham số thứ 2 là độ phức tạp của password, giá trị càng cao băm càng lâu
      username: nameFromEmail,
      displayName: nameFromEmail,
      verifyToken: uuidv4()
    }
    // luu thong tin user vao database
    const createdUser = await userModel.createNew(newUser)

    const getNewUser = await userModel.findOneById(createdUser.insertedId)
    // gui email cho nguoi dung de active tai khoan
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject = 'Welcome to our application! Please verify your email before using our services.'
    const htmlContent = `
      <h3>Welcome to our application!</h3>
      <h3>Here is your verification link:</h3>
      <a href="${verificationLink}">Verify Email</a>
      <h3>Sincerely,<br/>TienTDev</h3>
    `
    // goi toi provider gui email
    await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)
    // return tra du lieu ve controller
    // console.log('Sending email to:', getNewUser.email)
    return pickUserFields(getNewUser)
  } catch (error) {throw (error)}
}

const verifyAccount = async (reqBody) => {
  try {
    // query user trong db
    const existUser = await userModel.findOneByEmail(reqBody.email)
    // check user exist
    if (!existUser) { throw new ApiError(StatusCodes.NOT_FOUND, 'user not found')}
    if (existUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'your account already active')
    }
    // check token
    if (existUser.verifyToken !== reqBody.token?.trim()) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid token')
    }
    // update data
    const updateData = {
      isActive: true,
      verifyToken: null
    }
    // update user in db
    const updateUser = await userModel.update(existUser._id, updateData )
    // return user data
    return pickUserFields(updateUser)
  } catch (error) {throw error}
}

const login = async (reqBody) => {
  try {
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (!existUser) { throw new ApiError(StatusCodes.NOT_FOUND, 'user not found')}
    if (!existUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'your account is not active')
    }
    const comparedPassword = bcrypt.compareSync(reqBody.password, existUser.password)
    if (!comparedPassword) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'your email or password is not correct')
    }

    // thông tin đính kèm cho user trong JWT gồm _id và email của user
    const userInfo = { _id: existUser._id, email: existUser.email }
    // Tạo token cho người dùng trả về phía client
    // tạo ra 2 loại token: access token và refresh token
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
      // 5
    )
    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      env.REFRESH_TOKEN_LIFE
      // 15
    )
    // trả về thông tin người dùng kem 2 loại token
    return { accessToken, refreshToken, ...pickUserFields(existUser) }
  } catch (error) {throw error}
}
const refreshToken = async (clientRefreshToken) => {
  try {
    // b1 giai ma refreshtoken xem co hop le hay khong
    const decodedRefreshToken = await JwtProvider.verifyToken(clientRefreshToken, env.REFRESH_TOKEN_SECRET_SIGNATURE)
    console.log('🚀 ~ refreshToken ~ decodedRefreshToken:', decodedRefreshToken)
    // lay thong tin user tu refresh token
    const userInfo = {
      _id: decodedRefreshToken._id,
      email: decodedRefreshToken.email
    }
    // tao access token moi
    const newAccessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      env.ACCESS_TOKEN_LIFE
      // 5
    )
    return { accessToken: newAccessToken }
  } catch (error) {throw error}
}
const update = async (userId, reqBody, userAvatarFile) => {
  try {
    const existUser = await userModel.findOneById(userId)
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'user not found')
    if (!existUser.isActive) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'your account is not active')
    }
    // khởi tạo kết quả updated User ban đầu là empty
    let updatedUser = {}
    // case change password
    if (reqBody.current_password && reqBody.new_password) {
      // ktra current_password
      if (!bcrypt.compareSync(reqBody.current_password, existUser.password)) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'current_password is not correct')
      }
      // nếu current_password đúng thì băm mật khẩu mới rồi gửi lại vào db
      updatedUser = await userModel.update(existUser._id, {
        password: bcrypt.hashSync(reqBody.new_password, 8)
      })
    } else if (userAvatarFile) {
      // update file lên cloud storage cloudinary
      const uploadResult = await CloudinaryProvider.streamUpload(userAvatarFile.buffer, 'users')
      console.log('🚀 ~ update ~ uploadResult:', uploadResult)
      // lưu lại url của file ảnh vào database
      updatedUser = await userModel.update(existUser._id, {
        avatar: uploadResult.secure_url
      })
    } else {
      // update các thông tin displayName
      // console.log('🚀 ~ update ~ reqBody:', reqBody )
      updatedUser = await userModel.update(existUser._id, reqBody)
      // console.log('🚀 ~ update ~ updatedUser:', updatedUser)
    }
    // console.log('🚀 ~ update ~ updatedUser:', updatedUser)
    return pickUserFields(updatedUser)
  } catch (error) {throw error}

}
export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken,
  update
}