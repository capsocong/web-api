
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { boardService } from '~/services/boardService'

const createNew = async (req, res, next) => {
    try {
        // throw new ApiError(StatusCodes.BAD_REQUEST, 'Bad Request')
        // dieu huong request den service de xu ly
        const createdBoard = await boardService.createNew(req.body)
        // có kết quả thì trả về cho client
        res.status(StatusCodes.CREATED).json({createdBoard})

    }catch (error) { next(error) }
       
   
}

export const boardController = {
    createNew
}