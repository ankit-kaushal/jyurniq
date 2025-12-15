import mongoose from "mongoose";

const buildUriFromParts = () => {
  const user = process.env.DB_USERNAME;
  const pass = process.env.DB_PASSWORD;
  const cluster = process.env.DB_CLUSTER;
  const dbName = process.env.DB_NAME;

  if (user && pass && cluster && dbName) {
    const authUser = encodeURIComponent(user);
    const authPass = encodeURIComponent(pass);
    return `mongodb+srv://${authUser}:${authPass}@${cluster}.s7w4ras.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=${cluster}`;
  }

  return null;
};

const MONGODB_URI = process.env.MONGODB_URI || buildUriFromParts();

if (!MONGODB_URI) {
  throw new Error(
    "Database connection info missing. Set MONGODB_URI or DB_USERNAME, DB_PASSWORD, DB_CLUSTER, DB_NAME."
  );
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
   
  var __mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.__mongooseCache || {
  conn: null,
  promise: null,
};

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        dbName: process.env.MONGODB_DB || process.env.DB_NAME || undefined,
      })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  global.__mongooseCache = cached;
  return cached.conn;
}

export default dbConnect;

