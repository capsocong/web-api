import { StatusCodes } from 'http-status-codes'
import { cardService } from '~/services/cardService'
import { DEFAULT_LABELS } from '~/utils/labelConstants'

const createNew = async (req, res, next) => {
  try {
    const createdCard = await cardService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdCard)
  } catch (error) { next(error) }
}
const update = async (req, res, next) => {
  try {
    const cardId = req.params.id
    const cardCoverFile = req.file
    const updatedCard = await cardService.update(cardId, req.body, cardCoverFile)
    res.status(StatusCodes.OK).json(updatedCard)
  } catch (error) {next(error)}
}
const deleteItem = async (req, res, next) => {
  try {
    const cardId = req.params.id
    const result = await cardService.deleteItem(cardId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const getDefaultLabels = async (req, res, next) => {
  try {
    res.status(StatusCodes.OK).json(DEFAULT_LABELS)
  } catch (error) { next(error) }
}

const assignMember = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const cardId = req.params.id
    const { memberId } = req.body
    
    const updatedCard = await cardService.assignMember(userId, cardId, memberId)
    res.status(StatusCodes.OK).json(updatedCard)
  } catch (error) { next(error) }
}

const unassignMember = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const cardId = req.params.id
    const { memberId } = req.body
    const updatedCard = await cardService.unassignMember(userId, cardId, memberId)
    res.status(StatusCodes.OK).json(updatedCard)
  } catch (error) { next(error) }
}

export const cardController = {
  createNew,
  update,
  deleteItem,
  getDefaultLabels,
  assignMember,
  unassignMember
}
