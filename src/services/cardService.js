import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'
const createNew = async (reqBody) => {
  try {
    // Xử lý logic dữ liệu tùy đặc thù dự án
    const newCard = {
      ...reqBody
    }
    const createdCard = await cardModel.createNew(newCard)
    const getNewCard = await cardModel.findOneById(createdCard.insertedId)

    if (getNewCard) {
      // Cập nhật mảng cardOrderIds trong collection columns
      await columnModel.pushCardOrderIds(getNewCard)
    }

    return getNewCard
  } catch (error) { throw error }
}
const update = async (cardId, reqBody, cardCoverFile) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    let updatedCard = {}
    if (cardCoverFile) {
    // update file lên cloud storage cloudinary
      const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers')
      // lưu lại url của file ảnh vào database
      updatedCard = await cardModel.update(cardId, {
        cover: uploadResult.secure_url
      })
    } else {
      updatedCard = await cardModel.update(cardId, updateData)
    }

    return updatedCard
  } catch (error) {throw error }
}
const deleteItem = async (cardId) => {
  try {
    // Lấy thông tin card trước khi xóa để cập nhật column
    const targetCard = await cardModel.findOneById(cardId)
    if (!targetCard) {
      throw new Error('Card not found')
    }

    // Xóa card
    const deletedCard = await cardModel.deleteOneById(cardId)

    if (deletedCard.deletedCount > 0) {
      // Cập nhật mảng cardOrderIds trong column (xóa cardId khỏi mảng)
      await columnModel.pullCardOrderIds(targetCard)
    }

    return { message: 'Card deleted successfully' }
  } catch (error) { throw error }
}

export const cardService = {
  createNew,
  update,
  deleteItem
}
