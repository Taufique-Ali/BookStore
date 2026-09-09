import { Worker } from "bullmq";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import redisClient from "../config/redisConfig.js"; //connection
import OrderModel from "../models/order.model.js";
import { BookModel, UserModel, BankDetailsModel } from "../models/index.js";
import receiptTemplate from "../templates/receipt.template.js";


const RECEIPT_DIR = path.resolve("receipts");
if(!fs.existsSync(RECEIPT_DIR)) {
    fs.mkdirSync(RECEIPT_DIR);
}

const receiptWorker = new Worker(
    "receiptQueue",
    async (job) => {
        const { orderId } = job.data;
        console.log(`Generating receipt for orderId: ${orderId}`);

        // Fetch order details
        const order = await OrderModel.getOrderById(orderId);
        if (!order) {
            throw new Error(`Order not found: ${orderId}`);
        }

        const user = await UserModel.getUserById(order.userId);

        const orderItems = await OrderModel.getOrderItemsByOrderId(orderId);
        const itemsWithDetails = await Promise.all(
            orderItems.map(async (item) => {
                const book = await BookModel.getBookById(item.bookId);
                return {
                    ...item,
                    bookTitle: book ? book.title : "Unknown",
                    bookAuthor: book ? book.author : "Unknown",
                    shopId: book ? book.shop_id : null,
                };
            })
        );

        const shopId = itemsWithDetails.find(i => i.shopId)?.shopId || null;
        const bankDetails = await BankDetailsModel.getByShopId(shopId);

        // Generate receipt HTML
        const receiptHtml = receiptTemplate(order, itemsWithDetails, user, bankDetails);

        // Launch Puppeteer to generate PDF
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'], 
        });
        const page = await browser.newPage();
        await page.setContent(receiptHtml, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();

        // Save PDF to file
        const receiptPath = path.join(RECEIPT_DIR, `receipt_${orderId}.pdf`);
        fs.writeFileSync(receiptPath, pdfBuffer);

        console.log(`Receipt generated and saved to ${receiptPath}`);
    },
    { connection: redisClient }
);

receiptWorker.on("completed", (job) => {
    console.log(`Receipt generation completed for job ${job.id}`);
});

receiptWorker.on("failed", (job, err) => {
    console.error(`Receipt generation failed for job ${job.id}:`, err);
});

export default receiptWorker;