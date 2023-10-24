import { SearchQuery } from '~/models/requests/Search.requests'
import databaseService from '~/services/database.services'

class SearchService {
  async search({ limit, page, content }: { limit: number; page: number; content: string }) {
    const result = await databaseService.tweets
      .find({ $text: { $search: content } })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()
    return result
  }
}

const searchService = new SearchService()

export default searchService
