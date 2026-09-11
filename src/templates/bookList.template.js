const currency = (n) => Number(n).toFixed(2);

const bookListTemplate = (books, generatedDate) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #222;
      background: #fff;
      font-size: 12px;
    }

    .doc-title {
      text-align: center;
      font-size: 15px;
      font-weight: 700;
      color: #7d7a4f;
      padding: 0 0 4px;
    }
    .doc-sub {
      text-align: center;
      font-size: 11px;
      color: #888;
      padding-bottom: 14px;
    }

    table { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
    thead th {
      background: #a9a575;
      color: #fff;
      text-transform: uppercase;
      font-size: 10px;
      letter-spacing: 0.5px;
      padding: 8px 10px;
      text-align: left;
      border: 1px solid #a9a575;
    }
    thead th.num, tbody td.num { text-align: right; }
    thead th.center, tbody td.center { text-align: center; }
    tbody td {
      padding: 6px 10px;
      border: 1px solid #ddd;
      font-size: 11px;
      vertical-align: middle;
    }
    tbody tr:nth-child(even) { background: #f8f8f4; }
    tr { page-break-inside: avoid; }

    .book-title { font-weight: 600; }
    .book-isbn { color: #999; font-size: 10px; margin-top: 2px; }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge.in-stock { background: #eef6ee; color: #2e7d32; }
    .badge.out-of-stock { background: #fdeceb; color: #c0392b; }
  </style>
</head>
<body>
  <div class="doc-title">Book List</div>
  <div class="doc-sub">Generated on ${generatedDate} &middot; ${books.length} book(s)</div>

  <table>
    <thead>
      <tr>
        <th>Sr.No</th>
        <th>Book Name</th>
        <th>Author</th>
        <th>Genre</th>
        <th>Language</th>
        <th class="num">MRP</th>
        <th class="num">Price</th>
        <th class="num">Discount</th>
        <th class="center">Available Copies</th>
        <th class="center">Availability</th>
      </tr>
    </thead>
    <tbody>
      ${books.map((book, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>
          <div class="book-title">${book.title}</div>
          ${book.isbn ? `<div class="book-isbn">ISBN: ${book.isbn}</div>` : ''}
        </td>
        <td>${book.author || '-'}</td>
        <td>${book.genre || '-'}</td>
        <td>${book.language || '-'}</td>
        <td class="num">Rs. ${currency(book.mrp)}</td>
        <td class="num">Rs. ${currency(book.price)}</td>
        <td class="num">${book.discount}%</td>
        <td class="center">${book.available_copies}</td>
        <td class="center">
          ${book.available_copies > 0
            ? '<span class="badge in-stock">In Stock</span>'
            : '<span class="badge out-of-stock">Out of Stock</span>'}
        </td>
      </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>
`;

export default bookListTemplate;
