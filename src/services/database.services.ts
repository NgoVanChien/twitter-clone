import { MongoClient, ServerApiVersion } from 'mongodb'
import { config } from 'dotenv'
config()
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.nwcyuvd.mongodb.net/?retryWrites=true&w=majority`

// mongodb+srv://chienngo:chienngo123@twitter.nwcyuvd.mongodb.net/
// chien-galvin123

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri)

class DatabaseService {
  private client: MongoClient
  constructor() {
    this.client = new MongoClient(uri)
  }

  async connect() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      // await client.connect();
      // Send a ping to confirm a successful connection
      await this.client.db('admin').command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } finally {
      // Ensures that the client will close when you finish/error
      await this.client.close()
    }
  }
}

// Tạo object từ class DatabaseService
const databaseService = new DatabaseService()
export default databaseService
