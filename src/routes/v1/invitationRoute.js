import express from 'express'
import { invitationValidation } from '~/validations/invitationValidation'
import { invitationController } from '~/controllers/invitationController'
import { authMiddleware } from '~/middlewares/authMiddleware'
const Router = express.Router()

// Create a new board invitation
Router.route('/board')
  .post(authMiddleware.isAuthorized,
    invitationValidation.createNewBoardInvitation,
    invitationController.createNewBoardInvitation)

// Update board invitation status
Router.route('/board/:invitationId')
  .put(authMiddleware.isAuthorized,
    invitationValidation.updateBoardInvitation,
    invitationController.updateBoardInvitation)

// Get all invitations by user
Router.route('/')
  .get(authMiddleware.isAuthorized, invitationController.getAllInvitations)

export const invitationRoute = Router
