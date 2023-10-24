import { Pagination } from '~/models/requests/Tweet.requests'

export interface SearchQuery extends Pagination {
  content: string
}
