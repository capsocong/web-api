import joi from 'joi'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { EMAIL_RULE, EMAIL_RULE_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  const correctCondition = joi.object({
    email: joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    password: joi.string().required().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE)
  })
  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}
const verifyAccount = async (req, res, next) => {
  const correctCondition = joi.object({
    email: joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    token: joi.string().required()
  })
  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}
const login = async (req, res, next) => {
  const correctCondition = joi.object({
    email: joi.string().required().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    password: joi.string().required().pattern(PASSWORD_RULE).message(PASSWORD_RULE_MESSAGE)
  })
  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const update = async (req, res, next) => {
  const correctCondition = joi.object({
    displayName: joi.string().trim().strict(),
    current_password: joi.string().pattern(PASSWORD_RULE).message(`current_password: ${PASSWORD_RULE_MESSAGE}`),
    new_password: joi.string().pattern(PASSWORD_RULE).message(`new_password: ${PASSWORD_RULE_MESSAGE}`)
  })
  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false, allowUnknown: true })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}
export const userValidation = {
  createNew,
  verifyAccount,
  login,
  update
}

