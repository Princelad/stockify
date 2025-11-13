const PDFDocument = require("pdfkit");

class InvoicePDFService {
  constructor() {}

  /**
   * Generate a professional invoice PDF for a sale
   * @param {Object} sale - populated sale document
   * @param {Object} options - generation options
   * @returns {Promise<Buffer>}
   */
  async generateInvoicePDF(sale, options = {}) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: "A4", margin: 40 });
        const chunks = [];

        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", (err) => reject(err));

        // Document metadata
        doc.info = doc.info || {};
        doc.info.Title = `Invoice - ${sale.invoiceNumber || sale._id}`;
        doc.info.Creator = "Stockify";

        // Header: Company name and invoice info
        doc
          .fontSize(20)
          .font("Helvetica-Bold")
          .text(options.companyName || "Stockify", { align: "left" });
        doc.moveDown(0.2);
        doc
          .fontSize(10)
          .font("Helvetica")
          .text(options.companyAddress || "");
        doc.moveDown(1);

        // Invoice title and meta on the right
        const invoiceMetaTop = doc.y;
        const invoiceMetaX = 350;

        doc
          .fontSize(14)
          .font("Helvetica-Bold")
          .text("INVOICE", invoiceMetaX, invoiceMetaTop);
        doc
          .fontSize(10)
          .font("Helvetica")
          .text(
            `Invoice #: ${sale.invoiceNumber || sale._id}`,
            invoiceMetaX,
            doc.y + 2
          );
        doc.text(
          `Date: ${new Date(sale.createdAt).toLocaleDateString()}`,
          invoiceMetaX,
          doc.y + 2
        );
        doc.moveDown(1.2);

        // Customer details
        doc.fontSize(11).font("Helvetica-Bold").text("Bill To:");
        doc.fontSize(10).font("Helvetica");
        if (sale.customer) {
          const c = sale.customer;
          doc.text(c.name || "");
          if (c.address)
            doc.text(
              typeof c.address === "string"
                ? c.address
                : (c.address.line1 || "") +
                    (c.address.city ? ", " + c.address.city : "")
            );
          if (c.phone) doc.text(`Phone: ${c.phone}`);
          if (c.email) doc.text(`Email: ${c.email}`);
        } else if (sale.customerName) {
          doc.text(sale.customerName);
        } else {
          doc.text("Walk-in Customer");
        }

        doc.moveDown(1);

        // Table header
        const tableTop = doc.y + 10;
        const itemX = 40;
        const qtyX = 300;
        const unitX = 350;
        const lineTotalX = 450;

        doc.font("Helvetica-Bold");
        doc.fontSize(10);
        doc.text("Item", itemX, tableTop);
        doc.text("Qty", qtyX, tableTop);
        doc.text("Unit", unitX, tableTop);
        doc.text("Total", lineTotalX, tableTop, { align: "right" });

        doc
          .moveTo(itemX, tableTop + 15)
          .lineTo(550, tableTop + 15)
          .stroke("#eeeeee");
        doc.moveDown(1);

        // Items
        doc.font("Helvetica").fontSize(10);
        let y = tableTop + 20;
        for (const item of sale.items) {
          const name =
            item.productName || (item.product && item.product.name) || "Item";
          doc.text(this.truncate(name, 40), itemX, y);
          doc.text(item.quantity.toString(), qtyX, y);
          doc.text(this.formatCurrency(item.unitPrice), unitX, y);
          doc.text(this.formatCurrency(item.total), lineTotalX, y, {
            align: "right",
          });
          y += 18;
          // page break if necessary
          if (y > 720) {
            doc.addPage();
            y = 50;
          }
        }

        // Totals
        y += 10;
        doc.moveTo(itemX, y).lineTo(550, y).stroke("#eeeeee");
        y += 6;

        const rightLabelX = 380;
        doc.font("Helvetica-Bold").text("Subtotal:", rightLabelX, y);
        doc
          .font("Helvetica")
          .text(
            this.formatCurrency(
              sale.subtotal ||
                sale.items.reduce((a, b) => a + (b.total || 0), 0)
            ),
            lineTotalX,
            y,
            { align: "right" }
          );
        y += 16;

        doc.font("Helvetica-Bold").text("Discount:", rightLabelX, y);
        const discountValue =
          sale.discountAmount ||
          (sale.subtotal ? sale.subtotal - sale.totalAmount : 0);
        doc
          .font("Helvetica")
          .text(this.formatCurrency(discountValue), lineTotalX, y, {
            align: "right",
          });
        y += 16;

        doc.font("Helvetica-Bold").text("Total:", rightLabelX, y);
        doc
          .font("Helvetica-Bold")
          .text(
            this.formatCurrency(sale.totalAmount || sale.subtotal || 0),
            lineTotalX,
            y,
            { align: "right" }
          );
        y += 24;

        // Payment info
        doc
          .font("Helvetica")
          .fontSize(10)
          .text(`Payment Method: ${sale.paymentMethod || "cash"}`);
        doc.text(`Payment Status: ${sale.paymentStatus || "paid"}`);

        doc.moveDown(2);

        // Footer note
        doc
          .fontSize(9)
          .font("Helvetica")
          .fillColor("#666666")
          .text(options.footer || "Thank you for your business!", {
            align: "center",
          });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  truncate(str, n) {
    return str && str.length > n ? str.substr(0, n - 1) + "…" : str || "";
  }

  formatCurrency(value) {
    const v = typeof value === "number" ? value : parseFloat(value || 0);
    return "₦" + v.toFixed(2);
  }
}

module.exports = new InvoicePDFService();
