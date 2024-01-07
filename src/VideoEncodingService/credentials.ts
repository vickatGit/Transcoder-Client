import { config } from "dotenv";
config();

export const configObject = {
  region: `${process.env.MY_AWS_REGION}`,
  credentials: {
    accessKeyId: `${process.env.MY_AWS_ACCESS_ID}`,
    secretAccessKey: `${process.env.MY_AWS_SECRET_ACCESS_KEY}`,
  },
};
