import { Queue } from "bullmq";
import redisClient from "../config/redisConfig.js";

const receiptQueue = new Queue("receiptQueue", {
  connection: redisClient,
  maxRetries: 3, // Maximum number of retries for failed jobs
});

export default receiptQueue;