import mongoose from 'mongoose';
import { env } from './env.js';

const MONGOOSE_OPTIONS = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

export const connectDatabase = async () => {
  try {
    const connection = await mongoose.connect(env.mongoUri, MONGOOSE_OPTIONS);
    console.info(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.error('Make sure MongoDB is running or MONGO_URI in .env points to a valid instance.');
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.info('MongoDB reconnected.');
});

mongoose.connection.on('error', (error) => {
  console.error(`MongoDB error: ${error.message}`);
});
