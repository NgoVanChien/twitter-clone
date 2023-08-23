import { Router } from 'express'
import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator } from '~/middlewares/users.middlewares'
const usersRouter = Router()

// usersRouter.use((req, res, next) => {
//   console.log('Time: ', Date.now())
//   next()
// })

usersRouter.post('/login', loginValidator, loginController)
usersRouter.post('/register', registerController)

export default usersRouter
