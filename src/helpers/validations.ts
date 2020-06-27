import * as yup from 'yup'
import { ValidationError } from 'yup'

export const formatYupError = (err: ValidationError) => {
  const errors: Array<{ path: string; message: string }> = []

  err.inner.forEach((e) => {
    errors.push({
      path: e.path,
      message: e.message,
    })
  })

  return errors
  // return {
  //   errors: [
  //     formatResponse(
  //       new Response('password', `Invalid Password For: ${email} `, true)
  //     ),
  //   ],
  // }
}

//---------------------- AUTH YUP SCHEMA ---------------------------------------------------------//
const passwordNotLongEnough = 'password must be at least 6 characters'

export const AuthYupSchema = yup.object().shape({
  email: yup
    .string()
    .min(3, 'email must be at least 3 characters')
    .max(255)
    .email('email must be a valid email')
    .required(),
  password: yup.string().min(6, passwordNotLongEnough).max(255).required(),
})

export const registerPasswordValidation = yup
  .string()
  .min(3, passwordNotLongEnough)
  .max(255)
  .required()

export const changePasswordSchema = yup.object().shape({
  newPassword: registerPasswordValidation,
})

//---------------------- RECIPES YUP SCHEMA ---------------------------------------------------------//
const titleTooLong = 'title space is full, max 20 only'

export const RecipesYupSchema = yup.object().shape({
  // imgUrl: yup.string().required(),
  title: yup.string().max(20, titleTooLong).required(),
  ingredients: yup.string().required(),
  content: yup.string().required(),
  createdAt: yup.string().required(),
  // userId: yup.string().required()
})

//---------------------- PROFILE YUP SCHEMA ---------------------------------------------------------//
export const ProfileYupSchema = yup.object().shape({
  // dateOfBirth: yup.string().max(255).required(),
  // address: yup.string().max(255).required(),
  // hobbies: yup.string().max(255).required(),
  // companyRank: yup.string().max(255).required(),
  // currentLocation: yup.string().max(255).required(),
  // maritalStatus: yup.string().max(255).required(),

  dateOfBirth: yup.string().min(0),
  address: yup.string().min(0),
  hobbies: yup.string().min(0),
  companyRank: yup.string().min(0),
  currentLocation: yup.string().min(0),
  maritalStatus: yup.string().min(0),
})
