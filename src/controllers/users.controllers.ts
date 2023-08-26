import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody } from '~/models/requests/User.requests'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body
  if (email === 'galvin@gmail.com' && password === '123456') {
    return res.status(200).json({
      message: 'Login Success'
    })
  }
  return res.status(400).json({
    error: 'Login Failed'
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
  throw new Error('Loi')
  const result = await usersService.register(req.body)
  return res.json({
    message: 'Register success',
    result
  })
}
