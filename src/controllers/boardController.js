
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { boardService } from '~/services/boardService'

const createNew = async (req, res, next) => {
    try {
        // throw new ApiError(StatusCodes.BAD_REQUEST, 'Bad Request')
        const createdBoard = await boardService.createNew(req.body)
        res.status(StatusCodes.CREATED).json({createdBoard})

    }catch (error) { next(error) }
       
   
}

export const boardController = {
    createNew
}