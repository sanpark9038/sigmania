import { Client, Databases, Storage, Account, ID, Query } from 'appwrite'

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

export const databases = new Databases(client)
export const storage = new Storage(client)
export const account = new Account(client)
export { ID, Query }

export const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!
export const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ID!
export const BUCKET_IMAGES = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_IMAGES!
export const BUCKET_AUDIO = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_AUDIO!
export const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!
export const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
