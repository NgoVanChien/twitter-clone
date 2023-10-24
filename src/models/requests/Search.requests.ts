import { MediaTypeQuery } from '~/constants/enums'
import { Pagination } from '~/models/requests/Tweet.requests'

export interface SearchQuery extends Pagination {
  content: string
  media_type: MediaTypeQuery
}
