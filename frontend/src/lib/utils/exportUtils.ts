/**
 * Export utilities for reports and data
 * Provides functions to export data in various formats (CSV, PDF, Excel)
 */

export interface ExportData {
  filename: string;
  data: any[];
  headers: string[];
}

/**
 * Export data as CSV
 */
export const exportToCSV = ({ filename, data, headers }: ExportData) => {
  try {
    // Create CSV content
    const csvContent = [
      headers.join(","), // Header row
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header] || "";
            // Escape quotes and wrap in quotes if needed
            if (
              typeof value === "string" &&
              (value.includes(",") ||
                value.includes('"') ||
                value.includes("\n"))
            ) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(",")
      ),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    return { success: true, message: "CSV exported successfully" };
  } catch (error) {
    console.error("CSV export error:", error);
    return { success: false, error: "Failed to export CSV" };
  }
};

/**
 * Export data as JSON (for debugging)
 */
export const exportToJSON = ({
  filename,
  data,
}: Omit<ExportData, "headers">) => {
  try {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], {
      type: "application/json;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.json`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    return { success: true, message: "JSON exported successfully" };
  } catch (error) {
    console.error("JSON export error:", error);
    return { success: false, error: "Failed to export JSON" };
  }
};

/**
 * Generate PDF content (basic implementation)
 * Note: For production, consider using libraries like jsPDF or Puppeteer
 */
export const exportToPDF = async ({ filename, data, headers }: ExportData) => {
  try {
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${filename}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            h1 { color: #333; margin-bottom: 10px; }
            .export-info { color: #666; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>${filename}</h1>
          <div class="export-info">Generated on: ${new Date().toLocaleString()}</div>
          <table>
            <thead>
              <tr>
                ${headers.map((header) => `<th>${header}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (row) => `
                <tr>
                  ${headers
                    .map((header) => `<td>${row[header] || ""}</td>`)
                    .join("")}
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Open in new window for printing
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait a bit for content to load, then trigger print dialog
      setTimeout(() => {
        printWindow.print();
      }, 500);

      return { success: true, message: "PDF print dialog opened" };
    } else {
      throw new Error("Popup blocked - unable to open print window");
    }
  } catch (error) {
    console.error("PDF export error:", error);
    return { success: false, error: "Failed to export PDF" };
  }
};

/**
 * Format currency for export
 */
export const formatCurrencyForExport = (amount: number): string => {
  return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
};

/**
 * Format date for export
 */
export const formatDateForExport = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return (
    dateObj.toLocaleDateString("en-IN") +
    " " +
    dateObj.toLocaleTimeString("en-IN")
  );
};

/**
 * Prepare sales data for export
 */
export const prepareSalesDataForExport = (salesData: any[]) => {
  return salesData.map((sale) => ({
    Date: formatDateForExport(sale.date || sale.createdAt),
    "Invoice ID": sale.invoiceNumber || sale._id,
    Customer: sale.customer?.name || "Walk-in Customer",
    Items: sale.items?.length || 0,
    Subtotal: formatCurrencyForExport(sale.subtotal || 0),
    Tax: formatCurrencyForExport(sale.tax || 0),
    Discount: formatCurrencyForExport(sale.discount || 0),
    "Total Amount": formatCurrencyForExport(sale.totalAmount || 0),
    "Payment Method": sale.paymentMethod || "Cash",
    Status: sale.status || "Completed",
  }));
};

/**
 * Prepare inventory data for export
 */
export const prepareInventoryDataForExport = (inventoryData: any[]) => {
  return inventoryData.map((item) => ({
    SKU: item.sku || "",
    "Product Name": item.name || "",
    Category: item.category || "",
    Brand: item.brand || "",
    "Current Stock": item.currentStock || 0,
    "Min Stock Level": item.minStockLevel || 0,
    "Cost Price": formatCurrencyForExport(item.costPrice || 0),
    "Selling Price": formatCurrencyForExport(item.sellingPrice || 0),
    "Wholesale Price": formatCurrencyForExport(item.wholesalePrice || 0),
    "Total Value": formatCurrencyForExport(
      (item.currentStock || 0) * (item.sellingPrice || 0)
    ),
    Supplier: item.supplier?.name || "",
    "Last Updated": formatDateForExport(item.updatedAt || item.createdAt),
  }));
};

/**
 * Prepare tax data for export
 */
export const prepareTaxDataForExport = (taxData: any[]) => {
  return taxData.map((tax) => ({
    Period: tax.period || "",
    "GST Rate": tax.rate || "",
    "Taxable Amount": formatCurrencyForExport(tax.taxableAmount || 0),
    CGST: formatCurrencyForExport(tax.cgst || 0),
    SGST: formatCurrencyForExport(tax.sgst || 0),
    IGST: formatCurrencyForExport(tax.igst || 0),
    "Total Tax": formatCurrencyForExport(tax.totalTax || 0),
    Transactions: tax.transactions || 0,
  }));
};
