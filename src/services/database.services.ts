import { MongoClient, Db, Collection } from 'mongodb'
import { config } from 'dotenv'
import User from '~/models/schemas/User.schema'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import Follower from '~/models/schemas/Follower.schema'
import VideoStatus from '~/models/schemas/VideoStatus..schema'
import Tweet from '~/models/schemas/Tweet.schema'
import Hashtag from '~/models/schemas/Hashtag.schema'
config()

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.nwcyuvd.mongodb.net/?retryWrites=true&w=majority`

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }

  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log('Error', error)
      throw error
    }
  }

  // Create many indexs when start server, connected to database
  async indexUsers() {
    const exists = await this.users.indexExists(['email_1_password_1', 'email_1', 'username_1'])
    // console.log(exists)
    if (!exists) {
      // Create an index on the email field, password field, username field
      this.users.createIndex({ email: 1, password: 1 })
      this.users.createIndex({ email: 1 }, { unique: true })
      this.users.createIndex({ username: 1 }, { unique: true })
    }
  }

  async indexRefreshTokens() {
    const exists = await this.refreshTokens.indexExists(['exp_1', 'token_1'])

    if (!exists) {
      this.refreshTokens.createIndex({ token: 1 })
      this.refreshTokens.createIndex(
        { exp: 1 },
        {
          expireAfterSeconds: 0
        }
      )
    }
  }

  async indexVideoStatus() {
    const exists = await this.videoStatus.indexExists(['name_1'])

    if (!exists) {
      this.videoStatus.createIndex({ name: 1 })
    }
  }

  async indexFollowers() {
    const exists = await this.followers.indexExists(['user_id_1_followed_user_id_1'])
    if (!exists) {
      this.followers.createIndex({ user_id: 1, followed_user_id: 1 })
    }
  }

  get tweets(): Collection<Tweet> {
    console.log(process.env.DB_USERS_COLLECTION)
    return this.db.collection(process.env.DB_TWEETS_COLLECTION as string)
  }
  get users(): Collection<User> {
    console.log(process.env.DB_USERS_COLLECTION)
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
  }

  get followers(): Collection<Follower> {
    return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION as string)
  }

  get videoStatus(): Collection<VideoStatus> {
    return this.db.collection(process.env.DB_VIDEO_STATUS_COLLECTION as string)
  }

  get hashtags(): Collection<Hashtag> {
    return this.db.collection(process.env.DB_HASHTAGS_COLLECTION as string)
  }
}

// Tạo object từ class DatabaseService
const databaseService = new DatabaseService()
export default databaseService
