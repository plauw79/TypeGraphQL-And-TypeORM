// ############################# AUTH RESOLVERS ##############################
export const redisSessionPrefix = 'redisUserSids:'
export const userSessionIdPrefix = 'userSids:'
export const changePasswordPrefix = 'changePassword:'
export const recipeCacheKey = 'recipeCache'

// ############################# CONSTANTS ##############################
export const invalidLogin = 'invalid login'
export const confirmEmailError = 'please confirm your email'
export const forgotPasswordLockedError = 'account is locked'
export const duplicateEmail = 'already taken'

export const expiredKeyError = 'key has expired'
export const userNotFoundError = 'could not find user with that email'
