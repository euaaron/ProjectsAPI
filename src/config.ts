import { config } from "dotenv";
config();

export default {
  PORT: Number(process.env.PORT) || 3000,
};