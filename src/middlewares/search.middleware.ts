import { checkSchema } from 'express-validator'
import { MediaTypeQuery, PeopleFollow } from '~/constants/enums'
import { TWEETS_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validation'

export const searchValidator = validate(
  checkSchema(
    {
      content: {
        isString: {
          errorMessage: TWEETS_MESSAGES.CONTENT_MUST_BE_EMPTY_STRING
        }
      },
      media_type: {
        optional: true,
        isIn: {
          options: [Object.values(MediaTypeQuery)]
        },
        errorMessage: TWEETS_MESSAGES.MEDIA_TYPE_INVALID
      },
      people_follow: {
        optional: true,
        isIn: {
          options: [Object.values(PeopleFollow)],
          errorMessage: TWEETS_MESSAGES.PEOPLE_FOLLOW_INVALID
        }
      }
    },
    ['query']
  )
)
