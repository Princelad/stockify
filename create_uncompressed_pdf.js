const fs = require('fs');

// Create a very simple PDF with uncompressed text streams
function createUncompressedPDF() {
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
  /Font <<
    /F1 <<
      /Type /Font
      /Subtype /Type1
      /BaseFont /Helvetica
    >>
  >>
>>
>>
endobj

4 0 obj
<<
/Length 800
>>
stream
BT
/F1 12 Tf
50 750 Td
(Product Inventory List) Tj
0 -30 Td
(Product Name: Samsung Galaxy S24 Ultra) Tj
0 -15 Td
(SKU: SAM-S24U-512GB) Tj
0 -15 Td
(Price: $1199.99) Tj
0 -15 Td
(Quantity: 25 units) Tj
0 -15 Td
(Category: Electronics) Tj
0 -30 Td
(Product Name: Apple MacBook Pro M3) Tj
0 -15 Td
(SKU: APL-MBP-M3-16) Tj
0 -15 Td
(Price: $2499.00) Tj
0 -15 Td
(Quantity: 10 units) Tj
0 -15 Td
(Category: Computers) Tj
0 -30 Td
(Product Name: Sony WH-1000XM5 Headphones) Tj
0 -15 Td
(SKU: SNY-WH1000XM5-BK) Tj
0 -15 Td
(Price: $399.99) Tj
0 -15 Td
(Quantity: 50 units) Tj
0 -15 Td
(Category: Audio Equipment) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000317 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
1169
%%EOF`;

    const filePath = 'backend/uploads/pdfs/uncompressed_test.pdf';
    fs.writeFileSync(filePath, pdfContent);
    console.log(`Created uncompressed PDF: ${filePath}`);
    return filePath;
}

createUncompressedPDF();