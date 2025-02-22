import fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyHelmet from '@fastify/helmet';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import indexRouter from './routes/index.js';
import { logger } from './middleware/logger.js';
// import db from './config/mongodb.js';

dotenv.config();

const app = fastify({
  logger: true, // Habilita o logger do Fastify
});

const start = async () => {
  try {
    // Database
    // await app.register(db);

    // plugins
    await app.register(fastifyCookie);
    await app.register(fastifyHelmet);
    await app.register(cors);

    // Middlewares
    app.addHook('onRequest', logger);

    // Routes
    await app.register(indexRouter);

    // Catch 404 and forward to error handler
    app.setNotFoundHandler((_, reply) => {
      reply.status(404).send({ error: 'Not Found' });
    });

    // Error handler
    app.setErrorHandler((error, request, reply) => {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        url: request.url,
        method: request.method,
        body: request.body,
      });

      // Send error response
      reply.status(error.statusCode || 500).send({
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error : {},
      });
    });

    const PORT = Number(process.env.PORT) || 3000;
    const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

    await app.listen({
      port: PORT,
      host: HOST,
    });

    console.log(`Server is running on ${HOST}:${PORT}`);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();

export default app;
