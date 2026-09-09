const currency = (n) => Number(n).toFixed(2);

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function threeDigitsToWords(n) {
  let str = '';
  if (n >= 100) {
    str += ONES[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
  }
  if (n >= 20) {
    str += TENS[Math.floor(n / 10)] + ' ';
    n %= 10;
  }
  if (n > 0) {
    str += ONES[n] + ' ';
  }
  return str.trim();
}

function numberToWords(amount) {
  let n = Math.round(Number(amount));
  if (n === 0) return 'Zero';
  const crore = Math.floor(n / 10000000); n %= 10000000;
  const lakh = Math.floor(n / 100000); n %= 100000;
  const thousand = Math.floor(n / 1000); n %= 1000;
  const rest = n;

  const parts = [];
  if (crore) parts.push(`${threeDigitsToWords(crore)} Crore`);
  if (lakh) parts.push(`${threeDigitsToWords(lakh)} Lakh`);
  if (thousand) parts.push(`${threeDigitsToWords(thousand)} Thousand`);
  if (rest) parts.push(threeDigitsToWords(rest));

  return parts.join(' ').trim();
}

const receiptTemplateV2 = (order, items, user, bankDetails) => {
  const customerName = user?.name || `User #${order.userId}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #2b2b2b;
      background: #fff;
      font-size: 12px;
    }

    .sheet { padding: 0 0 40px 0; }

    .banner {
      display: flex;
      justify-content: space-between;
      align-items: stretch;
    }
    .banner-left {
      background: #1e3a5f;
      color: #fff;
      flex: 1;
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 20px 24px;
    }
    .banner-right {
      background: #e0653f;
      color: #fff;
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-end;
      min-width: 180px;
    }

    .logo-badge {
      width: 50px;
      height: 50px;
      flex-shrink: 0;
      border-radius: 10px;
      background: #e0653f;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo-badge svg { width: 26px; height: 26px; }

    .shop-name { font-size: 20px; font-weight: 700; letter-spacing: 0.3px; }
    .shop-sub { font-size: 11px; margin-top: 3px; opacity: 0.85; }

    .banner-right .tag { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.9; }
    .banner-right .num { font-size: 22px; font-weight: 800; margin-top: 4px; }
    .banner-right .date { font-size: 11px; margin-top: 4px; opacity: 0.9; }

    .doc-title {
      text-align: center;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #1e3a5f;
      padding: 14px 0 10px;
      border-bottom: 2px solid #f0d9d0;
    }

    .container { padding: 0 32px; }

    .bar {
      background: #1e3a5f;
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      padding: 6px 12px;
      display: flex;
      justify-content: space-between;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 24px;
    }

    .bill-row {
      display: flex;
      justify-content: space-between;
      border: 1px solid #e2e6ea;
      border-top: none;
      padding: 10px 12px 14px;
      margin-bottom: 4px;
    }
    .bill-row .left p { font-size: 13px; margin-top: 4px; }
    .bill-row .right { text-align: right; font-size: 12px; color: #555; }
    .bill-row .right div { margin-top: 3px; }

    table { width: 100%; border-collapse: collapse; margin: 20px 0 4px; }
    thead th {
      background: #1e3a5f;
      color: #fff;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
      padding: 9px 10px;
      text-align: left;
    }
    thead th.num, tbody td.num { text-align: right; }
    tbody td {
      padding: 9px 10px;
      border-bottom: 1px solid #eceff2;
      font-size: 12px;
    }
    tbody tr:nth-child(even) { background: #f9fafb; }
    tfoot td {
      padding: 9px 10px;
      border-top: 2px solid #1e3a5f;
      font-weight: 700;
      font-size: 12px;
    }

    .info-two-col {
      display: flex;
      gap: 16px;
      margin: 20px 0;
    }
    .info-two-col .box { flex: 1; border: 1px solid #e2e6ea; border-radius: 6px; overflow: hidden; }
    .info-two-col .box .bar { margin-top: 0; font-size: 10px; background: #e0653f; }
    .info-two-col .box .content { padding: 10px 12px; font-size: 12px; }
    .info-two-col .box .content div { display: flex; justify-content: space-between; padding: 3px 0; }
    .info-two-col .box .content div.grand { font-weight: 700; color: #1e3a5f; border-top: 1px solid #f0d9d0; margin-top: 4px; padding-top: 6px; }

    .terms-box { border: 1px solid #e2e6ea; border-radius: 6px; overflow: hidden; margin-bottom: 20px; }
    .terms-box .bar { margin-top: 0; background: #e0653f; }
    .terms-box .content { padding: 10px 12px; font-size: 12px; line-height: 1.6; }

    .bank-sign-row { display: flex; gap: 16px; margin-bottom: 28px; }
    .bank-box { flex: 1; border: 1px solid #e2e6ea; border-radius: 6px; overflow: hidden; }
    .bank-box .bar { margin-top: 0; background: #e0653f; }
    .bank-box .content { padding: 12px; font-size: 11px; line-height: 1.8; display: flex; gap: 14px; align-items: center; }
    .qr-placeholder {
      width: 70px; height: 70px; flex-shrink: 0;
      border: 1px dashed #e0653f;
      display: flex; align-items: center; justify-content: center;
      font-size: 8px; color: #e0653f; text-align: center;
      border-radius: 6px;
    }

    .sign-box { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 12px; border: 1px solid #e2e6ea; border-radius: 6px; }
    .sign-box .stamp {
      width: 100px; height: 60px;
      border: 2px solid #1e3a5f;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: #1e3a5f; font-weight: 700; font-size: 12px;
      margin-bottom: 8px;
    }
    .sign-box .label { font-size: 11px; color: #555; }

    .ack {
      border-top: 2px dashed #e0653f;
      margin-top: 12px;
      padding-top: 20px;
    }
    .ack-title { text-align: center; font-size: 13px; font-weight: 700; color: #e0653f; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .ack-shop { text-align: center; font-size: 16px; font-weight: 700; color: #1e3a5f; margin-bottom: 16px; }
    .ack-row { display: flex; justify-content: space-between; }
    .ack-row .col h5 { font-size: 10px; text-transform: uppercase; color: #e0653f; margin-bottom: 6px; }
    .ack-row .col p, .ack-row .col div { font-size: 12px; line-height: 1.6; }
    .ack-row .sign-line { margin-top: 40px; border-top: 1px solid #2b2b2b; width: 200px; text-align: center; font-size: 10px; padding-top: 4px; color: #555; }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="banner">
      <div class="banner-left">
        <div class="logo-badge">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4C9.5 2.5 6 2 3 3v14c3-1 6.5-0.5 9 1 2.5-1.5 6-2 9-1V3c-3-1-6.5-0.5-9 1z" fill="#fff"/>
          </svg>
        </div>
        <div>
          <div class="shop-name">BookHive</div>
          <div class="shop-sub">12 Library Lane, Book District &nbsp;|&nbsp; +91-00000-00000</div>
        </div>
      </div>
      <div class="banner-right">
        <div class="tag">Receipt No.</div>
        <div class="num">#${String(order.id).padStart(4, '0')}</div>
        <div class="date">${new Date(order.orderDate).toLocaleDateString()}</div>
      </div>
    </div>

    <div class="doc-title">Certified Book Purchase Receipt</div>

    <div class="container">
      <div class="bar"><span>Bill To</span><span>Invoice Details</span></div>
      <div class="bill-row">
        <div class="left">
          <p><strong>${customerName}</strong></p>
          <p>Shipping: ${order.shippingAddress}</p>
          <p>Billing: ${order.billingAddress}</p>
        </div>
        <div class="right">
          <div>Invoice No.: ${String(order.id).padStart(4, '0')}</div>
          <div>Date: ${new Date(order.orderDate).toLocaleDateString()}</div>
          <div>Payment: ${order.paymentMethod} (${order.paymentStatus})</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Sr.No</th>
            <th>Book Name</th>
            <th class="num">Qty</th>
            <th class="num">MRP</th>
            <th class="num">Discount</th>
            <th class="num">Price</th>
            <th class="num">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item, idx) => {
            const mrp = Number(item.priceAtPurchase) + Number(item.discountAtPurchase);
            const subtotal = Number(item.priceAtPurchase) * item.quantity;
            return `
            <tr>
              <td>${idx + 1}</td>
              <td>${item.bookTitle || `Book #${item.bookId}`}${item.bookAuthor ? ` <span style="color:#999;">by ${item.bookAuthor}</span>` : ''}</td>
              <td class="num">${item.quantity}</td>
              <td class="num">${currency(mrp)}</td>
              <td class="num">-${currency(item.discountAtPurchase)}</td>
              <td class="num">${currency(item.priceAtPurchase)}</td>
              <td class="num">${currency(subtotal)}</td>
            </tr>
          `;
          }).join("")}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2">Total</td>
            <td class="num">${items.reduce((s, i) => s + i.quantity, 0)}</td>
            <td colspan="4"></td>
          </tr>
        </tfoot>
      </table>

      <div class="info-two-col">
        <div class="box">
          <div class="bar">Invoice Amount In Words</div>
          <div class="content">Rupees ${numberToWords(order.finalAmount)} Only</div>
        </div>
        <div class="box">
          <div class="bar">Amounts</div>
          <div class="content">
            <div><span>Sub Total (MRP)</span><span>Rs. ${currency(order.totalAmount)}</span></div>
            <div><span>Discount</span><span>-Rs. ${currency(order.totalDiscount)}</span></div>
            ${Number(order.deliveryCharge) > 0 ? `<div><span>Delivery Charge</span><span>Rs. ${currency(order.deliveryCharge)}</span></div>` : ''}
            <div class="grand"><span>Total</span><span>Rs. ${currency(order.finalAmount)}</span></div>
          </div>
        </div>
      </div>

      <div class="terms-box">
        <div class="bar">Terms and Conditions</div>
        <div class="content">Thank you for shopping with us.<br>Manager: BookHive</div>
      </div>

      <div class="bank-sign-row">
        ${bankDetails ? `
        <div class="bank-box">
          <div class="bar">Bank Details</div>
          <div class="content">
            <div class="qr-placeholder">QR CODE<br>PLACEHOLDER</div>
            <div>
              Name: ${bankDetails.bank_name}<br>
              Account No.: ${bankDetails.account_no}<br>
              IFSC code: ${bankDetails.ifsc_code}<br>
              Account Holder: ${bankDetails.account_holder_name}
            </div>
          </div>
        </div>
        ` : ''}
        <div class="sign-box" style="${bankDetails ? '' : 'flex: 1 1 100%;'}">
          <div class="stamp">BH SEAL</div>
          <div class="label">For: BookHive<br>Authorized Signatory</div>
        </div>
      </div>

      <div class="ack">
        <div class="ack-title">Acknowledgment</div>
        <div class="ack-shop">BookHive</div>
        <div class="ack-row">
          <div class="col">
            <h5>Invoice To</h5>
            <p>${customerName}</p>
            <p>${order.shippingAddress}</p>
          </div>
          <div class="col">
            <h5>Invoice Details</h5>
            <div>Invoice No. : ${String(order.id).padStart(4, '0')}</div>
            <div>Invoice Date : ${new Date(order.orderDate).toLocaleDateString()}</div>
            <div>Invoice Amount : Rs. ${currency(order.finalAmount)}</div>
          </div>
          <div class="col">
            <div class="sign-line">Receiver's Seal &amp; Sign</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;
};

export default receiptTemplateV2;