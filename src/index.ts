import cors from 'cors';
import { Express } from 'express';
import 'express-async-errors';
import 'reflect-metadata';
import { Server } from './server';
import { Config } from './shared/configs/env';

const server = new Server();
const api: Express = server.load();

const { PORT, HOST } = Config;

api.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: [
      'Content-Type',      
      'Authorization',
      'Origin',
      'X-Requested-With',
      'Accept',
      'Access-Control-Allow-Origin',
    ],
    credentials: false,
  }),
);

api.listen(PORT, () => {
  console.log(`Server running at ${HOST}:${PORT}/`);
});

export default api;
