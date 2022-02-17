import { config } from 'dotenv';
config();

export const Config = {  
  HOST: process.env.HOST || 'http://localhost',
  PORT:
    Number.parseInt(process.env.PORT as string) ||  
    3000,
};
