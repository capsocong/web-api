
import multer from 'multer'
import { ALLOW_COMMON_FILE_TYPES, LIMIT_COMMON_FILE_SIZE } from '~/utils/validators'

// function kiểm tra loại file được chấp nhận
const customFileFilter = (req, file, callback) => {
//   console.log('🚀 ~ customFileFilter ~ file:', file)
  // đối với multer kiểm tra kiểu file sử dụng mimeType
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errMessage = 'File type is invalid. Only accept jpg, jpeg and png'
    return callback(errMessage, null)
  }
  // nếu như kiểu file hợp lệ
  return callback(null, true)

}
// khởi tạo function upload
const upload = multer({
  // giới hạn kích thước file
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  // kiểm tra kiểu file
  fileFilter: customFileFilter
})

export const multerUploadMiddleware = {
  upload
}