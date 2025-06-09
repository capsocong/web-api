import jwt from 'jsonwebtoken'

// function generateToken 3 tham số
// userInfo
// secretSignature: Chữ ký bí mật (một chuỗi string)
// tokenLife: thời gian sống của token
const generateToken = (userInfo, secretSignature, tokenLife) => {
  try {
    return jwt.sign(userInfo, secretSignature, {
      algorithm: 'HS256',
      expiresIn: tokenLife
    })
  } catch (error) { throw error}
}
// function check token is valid
// token hợp lẹ tức là có chữ ký hợp lệ, không bị thay đổi và chưa hết hạn
const verifyToken = (token, secretSignature) => {
  try {
    return jwt.verify(token, secretSignature)
  } catch (error) {throw error }
}

export const JwtProvider = {
  generateToken,
  verifyToken
}
