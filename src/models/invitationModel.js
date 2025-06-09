
import Joi from 'joi'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants'
import { ObjectId } from 'mongodb'
import { userModel } from './userModel'
import { boardModel } from './boardModel'

const INVALID_UPDATE_FIELDS = ['createdAt']
const INVITATION_COLLECTION_NAME = 'invitations'
// khai báo schema cho collection invitations
const INVITATION_COLLECTION_SCHEMA = Joi.object({
  // mô tả người đi mời
  inviterId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  // mô tả người được mời
  inviteeId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  // loại lời mời, hiện tại chỉ có board invitation
  type: Joi.string().required().valid(...Object.values(INVITATION_TYPES)),
  // thông tin lời mời vào board
  boardInvitation: Joi.object({
    boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    status: Joi.string().required().valid(...Object.values(BOARD_INVITATION_STATUS))
  }).optional(),

  createdAt: Joi.date().timestamp().default(Date.now),
  updatedAt: Joi.date().timestamp().default(null),
  _destroy: Joi.boolean().default(false)

})
// query tổng hợp (aggregate) để lấy những bản ghi invitation thuộc về một thằng user cụ thể
const findByUser = async (userId) => {
  try {
    const queryConditions = [
      // tìm theo người được mời - chính là người đang request
      { inviteeId: new ObjectId(userId) },
      { _destroy: false }
    ]
    const results = await GET_DB().collection(INVITATION_COLLECTION_NAME).aggregate([
      { $match: { $and: queryConditions } },
      { $lookup: {
        from: userModel.USER_COLLECTION_NAME,
        localField: 'inviterId', // người mời
        foreignField: '_id',
        as: 'inviter',
        pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
      } },
      { $lookup: {
        from: userModel.USER_COLLECTION_NAME,
        localField: 'inviteeId', // người được mời
        foreignField: '_id',
        as: 'invitee',
        pipeline: [{ $project: { 'password': 0, 'verifyToken': 0 } }]
      } },
      { $lookup: {
        from: boardModel.BOARD_COLLECTION_NAME,
        localField: 'boardInvitation.boardId', // lấy ra thông tin board
        foreignField: '_id',
        as: 'board'
      } }
    ]).toArray()

    return results
  } catch (error) {
    throw new Error(error)
  }

}
const validateBeforeCreate = async (data) => {
  return await INVITATION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}
const createNewBoardInvitation = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    let newInvitationToAdd = {
      ...validData,
      inviterId: new ObjectId(validData.inviterId),
      inviteeId: new ObjectId(validData.inviteeId),
    }
    if (validData.boardInvitation) {
      newInvitationToAdd.boardInvitation = {
        ...validData.boardInvitation,
        boardId: new ObjectId(validData.boardInvitation.boardId)
      }
    }

    // goi toi db de luu vao
    const createdInvitation = await GET_DB().collection(INVITATION_COLLECTION_NAME).insertOne(newInvitationToAdd)
    return createdInvitation

  } catch (error) {throw new Error(error)}
}
const findOneById = async (invitationId) => {
  try {
    const result = await GET_DB().collection(INVITATION_COLLECTION_NAME).findOne({ _id: new ObjectId(invitationId) })
    return result
  } catch (error) { throw new Error(error) }
}
const update = async (invitationId, updateData) => {
  try {
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName))
        delete updateData[fieldName]
    })
    if (updateData.boardInvitation) {
      updateData.boardInvitation = {
        ...updateData.boardInvitation,
        boardId: new ObjectId(updateData.boardInvitation.boardId)
      }
    }
    const result = await GET_DB().collection(INVITATION_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(invitationId) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {throw new Error(error)}

}

export const invitationModel = {
  INVITATION_COLLECTION_NAME,
  INVITATION_COLLECTION_SCHEMA,
  createNewBoardInvitation,
  findOneById,
  update,
  findByUser
}