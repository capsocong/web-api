
import { StatusCodes } from 'http-status-codes'
import { invitationService } from '~/services/invitationService'

const createNewBoardInvitation = async (req, res, next) => {
  try {
    // user thực hiện mời người khác vào board
    const inviterId = req.jwtDecoded._id
    const resInvitation = await invitationService.createNewBoardInvitation(req.body, inviterId)

    res.status(StatusCodes.CREATED).json(resInvitation)
  } catch (error) { next(error) }
}


const getAllInvitations = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const resinvitations = await invitationService.getAllInvitations(userId)
    res.status(StatusCodes.OK).json(resinvitations)
  } catch (error) {next(error)}
}

const updateBoardInvitation = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const { invitationId } = req.params
    const { status } = req.body

    const updatedInvitation = await invitationService.updateBoardInvitation(userId, invitationId, status)
    res.status(StatusCodes.OK).json(updatedInvitation)
  } catch (error) {next(error)}
}
export const invitationController = {
  createNewBoardInvitation,
  getAllInvitations,
  updateBoardInvitation
}