/* eslint-disable no-console */
import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import { envVars } from './app/config/env';
// import { seedSuperAdmin } from './app/utils/seedSuperAdmin';
// import { connectRedis } from './config/redis.config';

let server: Server;

const startServer = async () => {
  try {
    const uri = envVars.DB_URL;
    await mongoose.connect(uri);
    console.log('MongoDB is connected!!');

    server = app.listen(envVars.PORT, () => {
      console.log(`Server is listening on port ${envVars.PORT}`);
    });
  } catch (error) {
    console.log('Server error is ', error);
  }
};

(async () => {
  //   await connectRedis();
  await startServer();
  //   await seedSuperAdmin();
})();

// Unhandeld rejection error
process.on('unhandledRejection', (err) => {
  console.log(
    'Unhandled Rejection detected. Server is shutting down .. error is ',
    err,
  );

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

// Uncaught exception error
process.on('uncaughtException', (err) => {
  console.log(
    'Uncaught Exception detected. Server is shutting down .. error is ',
    err,
  );

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

// Signal termination error or sigterm
process.on('SIGTERM', () => {
  // Perameter a error asbena.
  console.log('Sigterm Signal recived. Server is shutting down.... ');

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});

// Signal termination error or sigterm
process.on('SIGINT', () => {
  // Perameter a error asbena.
  console.log('SIGINT Signal recived. Server is shutting down ... ');

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }

  process.exit(1);
});
