
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
    try {
        // throw new ApiError(StatusCodes.BAD_REQUEST, 'Bad Request')
        res.status(StatusCodes.CREATED).json({
            message: 'Create new board successfully',
            data: req.body
        })
    }catch (error) { next(error) }
       
   
}

export const boardController = {
    createNew
}