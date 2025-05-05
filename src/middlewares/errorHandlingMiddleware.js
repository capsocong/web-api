import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'

export const errorHandlingMiddleware = (err, req, res, next) => {
    // Nếu dev không cẩn thận thiếu statusCode thì mặc định sẽ để code 500 INTERNAL_SERVER_ERROR
    if (!err.statusCode) err.statusCode = StatusCodes.INTERNAL_SERVER_ERROR
    // Tạo ra một biến responseError để kiểm soát những gì muốn trả về
    const responseError = {
        statusCode: err.statusCode,
        message: err.message || StatusCodes[err.statusCode], // Nếu lỗi mà không có message thì lấy ReasonPhrases chuẩn theo mã Status Code
        stack: err.stack
      }
    console.log(env.BUILD_MODE)
    if (env.BUILD_MODE !== 'dev') delete responseError.stack // Nếu không phải môi trường dev thì xóa stack đi để tránh lộ thông tin nhạy cảm
    // Trả responseError về phía Front-end
    res.status(responseError.statusCode).json(responseError)
}