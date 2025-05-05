import ApiError from "~/utils/ApiError"
import { slugify } from "~/utils/formatter"
const createNew = async (reqBody) => {
try {
    const newBoard = {
        ...reqBody,
        slug: slugify(reqBody.title)
    }
    return newBoard
} catch (error) { throw error }
   
}

export const boardService = {
    createNew
}