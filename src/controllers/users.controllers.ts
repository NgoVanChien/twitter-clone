import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import {
  LoginReqBody,
  LogoutReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayload,
  VerifyEmailReqBody,
  VerifyForgotPasswordReqBody,
  forgotPasswordReqBody
} from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const result = await usersService.login(user_id.toString())
  return res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}

// export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
//   try {
//     const result = await usersService.register(req.body)

//     return res.json({
//       message: 'Register success',
//       result
//     })
//   } catch (error) {
//     return res.status(400).json({
//       message: 'Register failed',
//       error
//     })
//   }
// }

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  // throw new Error('Loi')
  const result = await usersService.register(req.body)
  return res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  const result = await usersService.logout(refresh_token)
  return res.json(result)
}

export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, VerifyEmailReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = await databaseService.users.findOne({
    _id: new ObjectId(user_id)
  })
  // Nếu không tìm thấy user thì mình sẽ báo lỗi
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }
  // Đã verify rồi thì mình sẽ không báo lỗi
  // Mà mình sẽ trả về status OK với message là đã verify trước đó rồi
  if (user.email_verify_token === '') {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  const result = await usersService.verifyEmail(user_id)
  return res.json({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result
  })
}

export const resendVerifyEmailController = async (
  req: Request<ParamsDictionary, any, VerifyEmailReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  }
  if (user.verify == UserVerifyStatus.Verified) {
    return res.json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    })
  }
  const result = await usersService.resendVerifyEmail(user_id)
  return res.json(result)
}

export const forgotPasswordlController = async (
  req: Request<ParamsDictionary, any, forgotPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { _id } = req.user as User
  const result = await usersService.forgotPassword((_id as ObjectId).toString())
  return res.json(result)
}

export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  return res.json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESS
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { password } = req.body
  const result = await usersService.resetPassword(user_id, password)
  return res.json(result)
}
