import dbConnect from './db';
export default dbConnect;
export async function connectToDatabase() {
  const conn = await dbConnect();
  return { db: conn.connection.db };
}
