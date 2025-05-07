
import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators.js'
import { GET_DB } from '~/config/mongodb'
// define collection schema
const BOARDS_COLLECTION_NAME = 'boards'
const BOARDS_COLLECTION_SCHEMA = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict(),
    slug: Joi.string().required().max(50).trim().strict(),
    description: Joi.string().required().min(3).max(200).trim().strict(),

    columnOrderIds: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),

    createdAt: Joi.date().timestamp('javascript').default(Date.now),
    updatedAt: Joi.date().timestamp('javascript').default(null),
    _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data) => {
    return await BOARDS_COLLECTION_SCHEMA.validateAsync(data, {abortEarly: false})
}

const createNew = async (data) => {
    try {
        // validate data
        const validData = await validateBeforeCreate(data)
        console.log('validData', validData)
        const createdBoard = await GET_DB().collection(BOARDS_COLLECTION_NAME).insertOne(validData)
        return createdBoard
    } catch (error) { throw new Error(error) }
}

const findOneById = async (id) => {
    try {
        const result = await GET_DB().collection(BOARDS_COLLECTION_NAME).findOne({ 
            _id: new ObjectId(id)
        })
        return result
    } catch (error) { throw new Error(error)  }
}
// query tong hop (aggregate) de lay toan bo column va card trong board
const getDetails = async (id) => {
    try {
        
        const result = await GET_DB().collection(BOARDS_COLLECTION_NAME).findOne({ 
            _id: new ObjectId(id)
        })
        return result
    } catch (error) { throw new Error(error)  }
}
export const boardModel = {
    BOARDS_COLLECTION_NAME,
    BOARDS_COLLECTION_SCHEMA,
    createNew,
    findOneById,
    getDetails
}