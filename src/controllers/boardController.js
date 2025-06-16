import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'

const createNew = async (req, res, next) => {
  try {
    // console.log('req.body: ', req.body)
    // console.log('req.query: ', req.query)
    // console.log('req.params: ', req.params)
    // console.log('req.files: ', req.files)
    // console.log('req.cookies: ', req.cookies)
    // console.log('req.jwtDecoded: ', req.jwtDecoded)
    const userId = await req.jwtDecoded._id

    const createdBoard = await boardService.createNew(userId, req.body)

    // Có kết quả thì trả về phía Client
    res.status(StatusCodes.CREATED).json(createdBoard)
  } catch (error) { next(error) }
}

const getDetails = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const boardId = req.params.id

    const board = await boardService.getDetails(userId, boardId)
    res.status(StatusCodes.OK).json(board)
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const boardId = req.params.id
    const updatedBoard = await boardService.update(userId, boardId, req.body)

    res.status(StatusCodes.OK).json(updatedBoard)
  } catch (error) { next(error) }
}

const moveCardToDifferentColumn = async (req, res, next) => {
  try {
    const result = await boardService.moveCardToDifferentColumn(req.body)

    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const getBoards = async (req, res, next) => {
  try {
    const userId = await req.jwtDecoded._id
    const { page, itemsPerPage, q } = req.query
    const queryFilter = q
    const boards = await boardService.getBoards(userId, page, itemsPerPage, queryFilter)
    res.status(StatusCodes.OK).json(boards)
  } catch (error) {next(error)}

}

const deleteItem = async (req, res, next) => {
  try {
    const boardId = req.params.id
    const result = await boardService.deleteItem(boardId)

    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const updateMemberRole = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const { id: boardId, memberId } = req.params
    const { role } = req.body
    
    const result = await boardService.updateMemberRole(userId, boardId, memberId, role)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const removeMember = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const { id: boardId, memberId } = req.params
    
    const result = await boardService.removeMember(userId, boardId, memberId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const boardController = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn,
  getBoards,
  deleteItem,
  updateMemberRole,
  removeMember
}
