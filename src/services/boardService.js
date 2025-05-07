import ApiError from "~/utils/ApiError"
import { slugify } from "~/utils/formatter"
import { boardModel } from "~/models/boardModel"
const createNew = async (reqBody) => {
try {
    const newBoard = {
        ...reqBody,
        slug: slugify(reqBody.title)
    }
    // goi toi tang model de xu ly luu ban ghi vao db
    const createdBoard = await boardModel.createNew(newBoard)
    // lay ban ghi board sau khi duoc goi
    const getBoard = await boardModel.findOneById(createdBoard.insertedId)
    console.log('getBoard', getBoard)
    console.log('createdBoard', createdBoard)
    return getBoard
    } catch (error) { throw error }   
}

export const boardService = {
    createNew
}