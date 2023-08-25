import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'
const usersRouter = Router()

// usersRouter.use((req, res, next) => {
//   console.log('Time: ', Date.now())
//   next()
// })

usersRouter.post('/login', loginValidator, loginController)
/**
 * Description. Register a new user
 * Path: /register
 * Method: POST
 * Body: { name: string, email: string, password: string, confirm_password: string, date_of_birth: ISO8601 }
 */
usersRouter.post(
  '/register',
  registerValidator,
  async (req, res, next) => {
    console.log('request handler 1')
    // next(new Error('Lỗi rồi bạn êi'))
    Promise.reject(new Error('Lỗi rồi bạn êi')).catch(next)
  },
  (req, res, next) => {
    console.log('request handler 2')
    next()
  },
  (req, res, next) => {
    console.log('request handler 3')
    res.json({ message: 'Register success' })
  },
  (err, req, res, next) => {
    console.log('Lỗi là', err.message)
    res.status(400).json({ error: err.message })
  }
)

export default usersRouter
