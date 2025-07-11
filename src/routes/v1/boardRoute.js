
import express from 'express'
import { boardValidation } from '~/validations/boardValidation'
import { boardController } from '~/controllers/boardController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { boardOwnerMiddleware } from '~/middlewares/boardOwnerMiddleware'
const Router = express.Router()

Router.route('/')
  .get(authMiddleware.isAuthorized, boardController.getBoards)
  .post(authMiddleware.isAuthorized, boardValidation.createNew, boardController.createNew)

Router.route('/:id')
  .get(authMiddleware.isAuthorized, boardController.getDetails)
  .put(authMiddleware.isAuthorized, boardOwnerMiddleware.isOwner, boardValidation.update, boardController.update)
  .delete(authMiddleware.isAuthorized, boardOwnerMiddleware.isOwner, boardValidation.deleteItem, boardController.deleteItem)

// API hỗ trợ việc di chuyển card giữa các column khác nhau trong một board
Router.route('/supports/moving_card')
  .put(authMiddleware.isAuthorized, boardValidation.moveCardToDifferentColumn, boardController.moveCardToDifferentColumn)

// Member management routes
Router.route('/:id/members/:memberId/role')
  .put(authMiddleware.isAuthorized, boardOwnerMiddleware.isOwner, boardController.updateMemberRole)

Router.route('/:id/members/:memberId')
  .delete(authMiddleware.isAuthorized, boardOwnerMiddleware.isOwner, boardController.removeMember)

export const boardRoute = Router
