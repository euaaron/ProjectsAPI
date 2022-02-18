import cors from 'cors';
import express, { Express, NextFunction, Request, Response } from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { ProjectsRouter } from '../projects/routes';
import { swaggerOptions } from '../shared/configs/swagger';
import { ApiError } from '../shared/models/error';

export class Server {
  private _instance: Express;

  constructor() {
    this._instance = express();
  }

  private loadMiddlewares() {
    this._instance.use(
      cors({
        origin: [
          'http://localhost:3000',
          'http://localhost:3001',
          'https://aaroncarneiro.com',
          '/.aaroncarneiro.com$/',
        ],
        preflightContinue: true,
        optionsSuccessStatus: 200,
      }),
    );
    this._instance.use(express.json());

    const specs = swaggerJSDoc(swaggerOptions);
    this._instance.use('/', swaggerUi.serve, swaggerUi.setup(specs));

    this._instance.use(
      (err: Error, request: Request, response: Response, _: NextFunction) => {
        if (err instanceof ApiError) {
          return response.status(err.statusCode).json({
            status: 'error',
            message: err.message,
          });
        }

        console.error(err);

        return response.status(500).json({
          status: 'error',
          message: err.message,
        });
      },
    );
  }

  private loadRoutes() {
    this._instance.use('/projects', cors(), ProjectsRouter());
  }

  public load() {
    this.loadRoutes();
    this.loadMiddlewares();
    return this._instance;
  }
}
