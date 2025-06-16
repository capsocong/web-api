import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { DEFAULT_PAGE, DEFAULT_ITEMS_PER_PAGE } from '~/utils/constants'
const createNew = async (userId, reqBody) => {
  try {
    // Xử lý logic dữ liệu
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    // Gọi tới tầng Model để xử lý lưu bản ghi newBoard vào trong Database
    const createdBoard = await boardModel.createNew(userId, newBoard)

    // Lấy bản ghi board sau khi gọi (tùy mục đích dự án mà có cần bước này hay không)
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)

    // Làm thêm các xử lý logic khác với các Collection khác tùy đặc thù dự án...vv
    // Bắn email, notification về cho admin khi có 1 cái board mới được tạo...vv

    // Trả kết quả về, trong Service luôn phải có return
    return getNewBoard
  } catch (error) { throw error }
}

const getDetails = async (userId, boardId) => {
  try {
    const board = await boardModel.getDetails(userId, boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }
    // B1: Deep Clone board ra một cái mới để xử lý, không ảnh hưởng tới board ban đầu, tùy mục đích về sau mà có cần clone deep hay không. (video 63 sẽ giải thích)
    // https://www.javascripttutorial.net/javascript-primitive-vs-reference-values/
    const resBoard = cloneDeep(board)
    // B2: Đưa card về đúng column của nó
    resBoard.columns.forEach(column => {
      // Cách dùng .equals này là bởi vì chúng ta hiểu ObjectId trong MongoDB có support method .equals
      column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id))

      // // Cách khác đơn giản là convert ObjectId về string bằng hàm toString() của JavaScript
      // column.cards = resBoard.cards.filter(card => card.columnId.toString() === column._id.toString())
    })
    // B3: Xóa mảng cards khỏi board ban đầu
    delete resBoard.cards
    return resBoard
  } catch (error) { throw error }
}

const update = async (userId, boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedBoard = await boardModel.update(boardId, updateData)

    return updatedBoard
  } catch (error) { throw error }
}

const moveCardToDifferentColumn = async (reqBody) => {
  try {
    // B1: Cập nhật mảng cardOrderIds của Column ban đầu chứa nó (Hiểu bản chất là xóa cái _id của Card ra khỏi mảng)
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updatedAt: Date.now()
    })
    // B2: Cập nhật mảng cardOrderIds của Column tiếp theo (Hiểu bản chất là thêm _id của Card vào mảng)
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updatedAt: Date.now()
    })
    // B3: Cập nhật lại trường columnId mới của cái Card đã kéo
    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId
    })

    return { updateResult: 'Successfully!' }
  } catch (error) { throw error }
}
const getBoards = async (userId, page, itemsPerPage, queryFilter) => {
  try {
    // Lấy danh sách boards của userId với phân trang
    if (!page) page = DEFAULT_PAGE
    if (!itemsPerPage) itemsPerPage = DEFAULT_ITEMS_PER_PAGE
    const results = await boardModel.getBoards(
      userId,
      parseInt(page, 10),
      parseInt(itemsPerPage, 10),
      queryFilter
    )
    return results
  } catch (error) { throw error }
}
const deleteItem = async (boardId) => {
  try {
    // Xóa tất cả cards thuộc board này
    await cardModel.deleteManyByBoardId(boardId)

    // Xóa tất cả columns thuộc board này
    await columnModel.deleteManyByBoardId(boardId)

    // Xóa board
    const deletedBoard = await boardModel.deleteOneById(boardId)

    if (deletedBoard.deletedCount > 0) {
      return { message: 'Board and all its content deleted successfully' }
    } else {
      throw new Error('Failed to delete board')
    }
  } catch (error) { throw error }
}

const updateMemberRole = async (userId, boardId, memberId, role) => {
  try {
    // Kiểm tra xem board có tồn tại và user có quyền owner không
    const board = await boardModel.findOneById(boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }

    // Kiểm tra quyền owner
    const isOwner = board.ownerIds.some(ownerId => ownerId.toString() === userId.toString())
    if (!isOwner) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Only board owners can manage member roles')
    }

    // Kiểm tra member có tồn tại trong board không
    const allMemberIds = [...board.ownerIds, ...board.memberIds].map(id => id.toString())
    if (!allMemberIds.includes(memberId)) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Member not found in this board')
    }

    // Không thể thay đổi role của chính mình
    if (userId === memberId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot change your own role')
    }

    // Chỉ hỗ trợ promote/demote giữa owner và member
    if (role === 'owner') {
      // Promote member to owner
      await boardModel.promoteToOwner(boardId, memberId)
    } else if (role === 'member') {
      // Demote owner to member (chỉ khi có ít nhất 2 owners)
      if (board.ownerIds.length <= 1) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot demote the last owner')
      }
      await boardModel.demoteToMember(boardId, memberId)
    } else {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid role. Only "owner" and "member" are supported')
    }

    // Trả về board đã cập nhật
    const updatedBoard = await boardModel.getDetails(userId, boardId)
    return updatedBoard
  } catch (error) { throw error }
}

const removeMember = async (userId, boardId, memberId) => {
  try {
    // Kiểm tra xem board có tồn tại và user có quyền owner không
    const board = await boardModel.findOneById(boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }

    // Kiểm tra quyền owner
    const isOwner = board.ownerIds.some(ownerId => ownerId.toString() === userId.toString())
    if (!isOwner) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Only board owners can remove members')
    }

    // Kiểm tra member có tồn tại trong board không
    const allMemberIds = [...board.ownerIds, ...board.memberIds].map(id => id.toString())
    if (!allMemberIds.includes(memberId)) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Member not found in this board')
    }

    // Không thể xóa chính mình
    if (userId === memberId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot remove yourself from the board')
    }

    // Không thể xóa owner cuối cùng
    const isTargetOwner = board.ownerIds.some(ownerId => ownerId.toString() === memberId)
    if (isTargetOwner && board.ownerIds.length <= 1) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot remove the last owner')
    }

    // Xóa member khỏi board
    await boardModel.removeMember(boardId, memberId)

    // Trả về board đã cập nhật
    const updatedBoard = await boardModel.getDetails(userId, boardId)
    return updatedBoard
  } catch (error) { throw error }
}

export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards,
  deleteItem,
  updateMemberRole,
  removeMember
}
