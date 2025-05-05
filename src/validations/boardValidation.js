
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'


const  createNew = async (req, res, next) => {
    const correctCondition = Joi.object({
        title: Joi.string().required().min(3).max(50).trim().strict(),
        description: Joi.string().required().min(3).max(200).trim().strict(),
    })
    try {
        console.log(req.body)
        // set abortEarly false để nhận tất cả các lỗi validation
        await correctCondition.validateAsync(req.body, {abortEarly: false})
        // validation thành công thì gọi next() để requests sang controller
        next()        
    }
    catch (error) {
        const errorMessage = new Error(error).message
        const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
        next(customError)
    }
}
export const boardValidation = {
    createNew
}