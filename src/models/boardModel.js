
import Joi from 'joi'

// define collection schema
const BOARDS_COLLECTION_NAME = 'boards'
const BOARDS_COLLECTION_SCHEMA = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict(),
    slug: Joi.string().required().max(50).trim().strict(),
    description: Joi.string().required().min(3).max(200).trim().strict(),

    columnOrderIds: Joi.array().items(Joi.string()).default([]),

    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null),
    _destroy: Joi.boolean().default(false)
})

export const boardModel = {
    BOARDS_COLLECTION_NAME,
    BOARDS_COLLECTION_SCHEMA
}