import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { BookModel } from "../models/index.js";
import bookListTemplate from "../templates/bookList.template.js";

const RECEIPT_DIR = path.resolve("receipts");
if (!fs.existsSync(RECEIPT_DIR)) {
    fs.mkdirSync(RECEIPT_DIR);
}

const HEADER_TEMPLATE = `
  <div style="width:100%; font-size:9px; padding:0 24px; box-sizing:border-box;">
    <div style="border-bottom:1px solid #a9a575; width:100%; padding-bottom:4px;">
      <div style="font-weight:700; font-size:11px; color:#7d7a4f;">BookHive</div>
      <div style="font-size:8px; color:#999;">Address: 12 Library Lane, Book District &nbsp;|&nbsp; Ph. no.: +91-00000-00000</div>
    </div>
  </div>
`;

const FOOTER_TEMPLATE = `
  <div style="width:100%; font-size:9px; text-align:center; color:#999; padding:0 24px; box-sizing:border-box;">
    Page <span class="pageNumber"></span> of <span class="totalPages"></span>
  </div>
`;

class BookService{

    static async getAllBooks(shop_id = null) {
        const books = await BookModel.getAllBooks(shop_id);
        return books;
    }

    static async generateBookListPdf(shop_id = null) {
        const books = await BookModel.getAllBooks(shop_id);
        const html = bookListTemplate(books, new Date().toLocaleDateString());

        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        try {
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: "networkidle0" });
            const pdfBuffer = await page.pdf({
                format: "A4",
                printBackground: true,
                displayHeaderFooter: true,
                headerTemplate: HEADER_TEMPLATE,
                footerTemplate: FOOTER_TEMPLATE,
                margin: { top: "70px", bottom: "40px", left: "24px", right: "24px" },
            });

            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const filePath = path.join(RECEIPT_DIR, `book-list_${shop_id}_${timestamp}.pdf`);
            fs.writeFileSync(filePath, pdfBuffer);

            return pdfBuffer;
        } finally {
            await browser.close();
        }
    }

    static async getBookById(bookId) {
        const book = await BookModel.getBookById(bookId);
        return book;
    }
    
    static async createBook(bookData) {
        const { title, author, genre, published_year, summary, isbn, available_copies, mrp, price, discount, language, shop_id } = bookData;
        const bookId = await BookModel.createBook(title, author, genre, published_year, summary, isbn, available_copies, mrp, price, discount, language, shop_id);
        return bookId;
    }

    static async updateBook(bookId, updatedFields) {
        const updated = await BookModel.updateBook(bookId, updatedFields);
        return updated;
    }

    static async deleteBook(bookId) {
        const deleted = await BookModel.deleteBook(bookId);
        return deleted;
    }
}

export { BookService };