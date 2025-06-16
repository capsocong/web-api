import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { boardModel } from '~/models/boardModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
const createNew = async (reqBody) => {
  try {
    // Xử lý logic dữ liệu tùy đặc thù dự án
    const newCard = {
      ...reqBody
    }
    const createdCard = await cardModel.createNew(newCard)
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)

    if (getNewCard) {
      // Cập nhật mảng cardOrderIds trong collection columns
      await columnModel.pushCardOrderIds(getNewCard)
    }

    return getNewCard
  } catch (error) { throw error }
}
const update = async (cardId, reqBody, cardCoverFile) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    let updatedCard = {}
    if (cardCoverFile) {
    // update file lên cloud storage cloudinary
      const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers')
      // lưu lại url của file ảnh vào database
      updatedCard = await cardModel.update(cardId, {
        cover: uploadResult.secure_url
      })
    } else {
      updatedCard = await cardModel.update(cardId, updateData)
    }

    return updatedCard
  } catch (error) {throw error }
}
const deleteItem = async (cardId) => {
  try {
    // Lấy thông tin card trước khi xóa để cập nhật column
    const targetCard = await cardModel.findOneById(cardId)
    if (!targetCard) {
      throw new Error('Card not found')
    }

    // Xóa card
    const deletedCard = await cardModel.deleteOneById(cardId)

    if (deletedCard.deletedCount > 0) {
      // Cập nhật mảng cardOrderIds trong column (xóa cardId khỏi mảng)
      await columnModel.pullCardOrderIds(targetCard)
    }

    return { message: 'Card deleted successfully' }
  } catch (error) { throw error }
}
const assignMember = async (userId, cardId, memberId) => {
  try {
    // Lấy thông tin card
    const targetCard = await cardModel.findOneById(cardId)
    if (!targetCard) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found!')
    }

    // Lấy thông tin board để kiểm tra quyền
    const board = await boardModel.findOneById(targetCard.boardId.toString())
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }

    // Kiểm tra user có phải owner của board không
    const isOwner = board.ownerIds.some(ownerId => ownerId.toString() === userId.toString())
    if (!isOwner) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Only board owners can assign members to cards')
    }

    // Kiểm tra member có thuộc board không
    const allBoardMemberIds = [...board.ownerIds, ...board.memberIds].map(id => id.toString())
    if (!allBoardMemberIds.includes(memberId)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'User is not a member of this board')
    }

    // Kiểm tra member đã được assign chưa
    if (targetCard.memberIds.includes(memberId)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Member is already assigned to this card')
    }

    // Assign member vào card
    const updatedCard = await cardModel.assignMember(cardId, memberId)
    return updatedCard
  } catch (error) { throw error }
}

const unassignMember = async (userId, cardId, memberId) => {
  try {
    // Lấy thông tin card
    const targetCard = await cardModel.findOneById(cardId)
    if (!targetCard) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Card not found!')
    }

    // Lấy thông tin board để kiểm tra quyền
    const board = await boardModel.findOneById(targetCard.boardId.toString())
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }

    // Kiểm tra user có phải owner của board không
    const isOwner = board.ownerIds.some(ownerId => ownerId.toString() === userId.toString())
    if (!isOwner) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Only board owners can unassign members from cards')
    }

    // Kiểm tra member có được assign không
    if (!targetCard.memberIds.includes(memberId)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Member is not assigned to this card')
    }

    // Unassign member khỏi card
    const updatedCard = await cardModel.unassignMember(cardId, memberId)
    return updatedCard
  } catch (error) { throw error }
}

export const cardService = {
  createNew,
  update,
  deleteItem,
  assignMember,
  unassignMember
}
