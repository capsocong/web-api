
import ApiError from '~/utils/ApiError'
import { userModel } from '~/models/userModel'
import { invitationModel } from '~/models/invitationModel'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants'
import { pickUserFields } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
import { StatusCodes } from 'http-status-codes'


const createNewBoardInvitation = async (reqBody, inviterId) => {
  try {
    // người mời: là người đang request tìm theo id lấy từ token
    const inviter = await userModel.findOneById(inviterId)
    console.log('🚀 ~ createNewBoardInvitation ~ inviter:', inviter)
    // người được mời: tìm theo email trong reqBody nhận từ phía fe
    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail)
    console.log('🚀 ~ createNewBoardInvitation ~ invitee:', invitee)
    // Tìm board để lấy dữ liệu xử lý
    const board = await boardModel.findOneById(reqBody.boardId)
    console.log('🚀 ~ createNewBoardInvitation ~ board:', board)
    if (!inviter || !invitee || !board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter, invitee or board not found')
    }

    // tao data de luu vao trong db

    const newInvitationData = {
      inviterId,
      inviteeId: invitee._id.toString(),
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING // default status khi tạo lời mời
      }
    }

    // goi toi model de luu vao db
    const createdInvitation = await invitationModel.createNewBoardInvitation(newInvitationData)
    const getInvitation = await invitationModel.findOneById(createdInvitation.insertedId)

    const resInvitation = {
      ...getInvitation,
      board,
      inviter: pickUserFields(inviter),
      invitee: pickUserFields(invitee)
    }
    return resInvitation
  } catch (error) {throw error}
}
export const getAllInvitations = async (userId) => {
  try {
    const getInvitations = await invitationModel.findByUser(userId)
    console.log('getInvitations: ', getInvitations)

    // vì các dữ liệu inviter,invitee và board đang ở giá trị mảng 1 phần tử nên cần biến đổi về json object trc khi trả về cho client
    const resInvitations = getInvitations.map(i => {
      return {
        ...i,
        inviter: i.inviter[0] || {},
        invitee: i.invitee[0] || {},
        board: i.board[0] || {}
      }
    })
    return resInvitations
  } catch (error) {throw error}
}
const updateBoardInvitation = async (userId, invitationId, status) => {
  try {
    // tìm bản ghi invitationId
    const getInvitation = await invitationModel.findOneById(invitationId)
    if (!getInvitation) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found')
    }
    // sau khi có getInvitation rồi thì lấy full thông tin của board
    const boardId = getInvitation.boardInvitation.boardId
    const getBoard = await boardModel.findOneById(boardId)
    if (!getBoard) { throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')}

    const boardOwnerAndMemberIds = [...getBoard.ownerIds, ...getBoard.memberIds].toString()
    if (status === BOARD_INVITATION_STATUS.ACCEPTED && boardOwnerAndMemberIds.includes(userId)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'You are already a member of this board')
    }

    // tạo dữ liệu để cập nhật bản ghi lời mời
    const updateData = {
      boardInvitation: {
        ...getInvitation.boardInvitation,
        status: status // status sẽ là 'đã chấp nhận' hoặc 'đã từ chối'
      }
    }
    //b1 cập nhật status trong bản ghi invitation
    const updatedInvitation = await invitationModel.update(invitationId, updateData)
    //b2 nếu status là accepted thì thêm người được mời vào bản ghi memberIds
    if (updatedInvitation.boardInvitation.status === BOARD_INVITATION_STATUS.ACCEPTED) {
      await boardModel.pushMembersIds(boardId, userId)
    }
    return updatedInvitation
  } catch (error) { throw error}
}
export const invitationService = {
  createNewBoardInvitation,
  getAllInvitations,
  updateBoardInvitation
}