import { StatusCodes } from 'http-status-codes'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'

// Middleware kiểm tra quyền owner của board
const isOwner = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const boardId = req.params.id
    // Lấy thông tin board
    const board = await boardModel.findOneById(boardId)
    if (!board) {
      next(new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy bảng'))
      return
    }
    // Kiểm tra xem user có phải là owner không
    const isOwner = board.ownerIds.some(ownerId =>
      ownerId.toString() === userId.toString()
    )
    if (!isOwner) {
      next(new ApiError(StatusCodes.FORBIDDEN, 'Chỉ có chủ sở hữu bảng mới có thể thực hiện hành động này'))
      return
    }
    // Lưu board info vào req để sử dụng ở controller
    req.board = board
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Lỗi kiểm tra quyền sở hữu bảng'))
  }
}

export const boardOwnerMiddleware = {
  isOwner
}
