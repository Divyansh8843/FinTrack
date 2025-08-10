import mongoose from "mongoose";

// Read env at module load but validate at call time to avoid build-time failures
const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalWithMongoose = globalThis as typeof globalThis & {
  mongoose?: MongooseCache;
};

const cached: MongooseCache =
  globalWithMongoose.mongoose ??
  (globalWithMongoose.mongoose = { conn: null, promise: null });

async function dbConnect() {
  if (cached.conn) return cached.conn;
  const uri = MONGODB_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI environment variable");
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, { bufferCommands: false })
      .then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;