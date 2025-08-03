/* eslint-disable no-console */
import { createClient } from 'redis';
import { envVars } from './env';

export const redisClient = createClient({
  username: envVars.REDIS_USERNAME,
  password: envVars.REDIS_PASSWORD,
  socket: {
    host: envVars.REDIS_HOST,
    port: Number(envVars.REDIS_PORT),
  },
});

// connection a kono error hole aikhane error throw hoia console hobe,
redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Aivabe redis a property and value set korte hoi and redisClient.get("keyName") dia get korte hoi.
// await redisClient.set("foo", "bar");
// const result = await redisClient.get("foo");
// console.log(result); // >>> bar

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('Redis Connected');
  }
};
