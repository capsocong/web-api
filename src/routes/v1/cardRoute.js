import express from 'express'
import { cardValidation } from '~/validations/cardValidation'
import { cardController } from '~/controllers/cardController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { multerUploadMiddleware } from '~/middlewares/multerUploadMiddleware'
const Router = express.Router()

Router.route('/')
  .post(authMiddleware.isAuthorized, cardValidation.createNew, cardController.createNew)

Router.route('/default-labels')
  .get(authMiddleware.isAuthorized, cardController.getDefaultLabels)

Router.route('/:id')
  .put(
    authMiddleware.isAuthorized,
    multerUploadMiddleware.upload.single('cardCover'),
    cardValidation.update,
    cardController.update
  )
  .delete(authMiddleware.isAuthorized, cardValidation.deleteItem, cardController.deleteItem)

Router.route('/:id/assign-member')
  .put(authMiddleware.isAuthorized, cardController.assignMember)

Router.route('/:id/unassign-member')
  .put(authMiddleware.isAuthorized, cardController.unassignMember)

export const cardRoute = Router
