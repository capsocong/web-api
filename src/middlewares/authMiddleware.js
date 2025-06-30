import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/JwtProvider'
import ApiError from '~/utils/ApiError'

const isAuthorized = async (req, res, next) => {
  // lấy access token nằm trong request cookies phía client - withCredentials
  const clientAccessToken = req.cookies?.accessToken

  if (!clientAccessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED không tìm thấy access token'))
    return
  }

  try {
    // b1 giai ma access token
    const decodedAccessToken = await JwtProvider.verifyToken(clientAccessToken, env.ACCESS_TOKEN_SECRET_SIGNATURE)
    // b2 gán decodedAccessToken vào req.user
    req.jwtDecoded = decodedAccessToken
    // b3 tiếp tục xử lý request
    return next()
  } catch (error) {
    // nếu access token không hợp lệ hoặc đã hết hạn
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'cần làm mới token'))
      return
    }
    // nếu như access token không hợp lệ trả về mã lỗi 401 UNAUTHORIZED
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED'))
  }
}


export const authMiddleware = {
  isAuthorized
}