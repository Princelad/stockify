const PDFDocument = require('pdfkit');

/**
 * Label PDF Generation Service
 * Generates printable PDF labels based on templates and data
 */

class LabelPDFService {
    constructor() {
        // Standard label sizes in points (72 points = 1 inch)
        this.labelSizes = {
            '2" x 1"': { width: 144, height: 72 },
            '3" x 2"': { width: 216, height: 144 },
            '1.5" x 1"': { width: 108, height: 72 },
            '2" x 0.75"': { width: 144, height: 54 },
            '4" x 2"': { width: 288, height: 144 },
            '3" x 1"': { width: 216, height: 72 }
        };
        
        // Page margins
        this.pageMargin = 36; // 0.5 inch
        this.labelSpacing = 4; // Space between labels
    }

    /**
     * Generate PDF with labels
     * @param {Array} labels - Array of label data
     * @param {Object} template - Template configuration
     * @param {Object} options - Generation options
     * @returns {Buffer} PDF buffer
     */
    async generateLabelsPDF(labels, template, options = {}) {
        console.log('Starting PDF generation with:', { 
            labelCount: labels.length, 
            templateName: template.name,
            templateSize: template.size 
        });
        
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    size: options.pageSize || 'A4',
                    margin: this.pageMargin,
                    info: {
                        Title: `Labels - ${template.name}`,
                        Subject: 'Product Labels',
                        Creator: 'Stockify Label Generator',
                        CreationDate: new Date()
                    }
                });

                const chunks = [];
                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => {
                    console.log('PDF generation completed, buffer size:', Buffer.concat(chunks).length);
                    resolve(Buffer.concat(chunks));
                });
                doc.on('error', (error) => {
                    console.error('PDF generation error:', error);
                    reject(error);
                });

                // Get label dimensions
                const labelSize = this.labelSizes[template.size] || this.labelSizes['2" x 1"'];
                
                // Calculate page layout
                const pageWidth = doc.page.width - (2 * this.pageMargin);
                const pageHeight = doc.page.height - (2 * this.pageMargin);
                
                const labelsPerRow = Math.floor(pageWidth / (labelSize.width + this.labelSpacing));
                const labelsPerColumn = Math.floor(pageHeight / (labelSize.height + this.labelSpacing));
                const labelsPerPage = labelsPerRow * labelsPerColumn;

                let currentPosition = 0;
                let currentPage = 1;

                for (let i = 0; i < labels.length; i++) {
                    // Add new page if needed
                    if (i > 0 && i % labelsPerPage === 0) {
                        doc.addPage();
                        currentPosition = 0;
                        currentPage++;
                    }

                    // Calculate label position on page
                    const row = Math.floor(currentPosition / labelsPerRow);
                    const col = currentPosition % labelsPerRow;
                    
                    const x = this.pageMargin + (col * (labelSize.width + this.labelSpacing));
                    const y = this.pageMargin + (row * (labelSize.height + this.labelSpacing));

                    // Draw the label
                    this.drawLabel(doc, labels[i], template, x, y, labelSize);

                    currentPosition++;
                }

                // Add metadata footer on last page
                this.addMetadata(doc, labels.length, template, currentPage);

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Draw individual label
     */
    drawLabel(doc, labelData, template, x, y, labelSize) {
        // Save graphics state
        doc.save();

        // Move to label position
        doc.translate(x, y);

        // Draw border if enabled
        if (template.settings?.showBorder !== false) {
            doc.rect(0, 0, labelSize.width, labelSize.height)
               .stroke(template.settings?.borderColor || '#000000');
        }

        // Set font and color
        const fontSize = template.settings?.fontSize || 10;
        const fontFamily = this.getFontFamily(template.settings?.fontFamily || 'Arial');
        const textColor = template.settings?.textColor || '#000000';
        const padding = template.settings?.padding || 4;

        doc.font(fontFamily)
           .fontSize(fontSize)
           .fillColor(textColor);

        // Draw label content based on type
        if (labelData.type === 'product') {
            this.drawProductLabel(doc, labelData.content, template, labelSize, padding);
        } else if (labelData.type === 'custom') {
            this.drawCustomLabel(doc, labelData.content, template, labelSize, padding);
        }

        // Restore graphics state
        doc.restore();
    }

    /**
     * Draw product label content
     */
    drawProductLabel(doc, content, template, labelSize, padding) {
        const fields = template.fields || [];
        const lineHeight = (template.settings?.fontSize || 10) + 2;
        let currentY = padding;

        // Calculate total height needed
        const totalLines = fields.length + (content.barcode ? 1 : 0);
        const totalHeight = totalLines * lineHeight;
        const availableHeight = labelSize.height - (2 * padding);

        // Adjust starting Y if content doesn't fill the label
        if (totalHeight < availableHeight) {
            currentY += (availableHeight - totalHeight) / 2;
        }

        fields.forEach((field, index) => {
            if (content[field] && currentY < labelSize.height - padding) {
                let text = '';
                let fontStyle = template.settings?.fontFamily || 'Arial';

                switch (field) {
                    case 'name':
                        text = this.truncateText(doc, content.name, labelSize.width - (2 * padding));
                        fontStyle = 'Arial-Bold';
                        break;
                    case 'sku':
                        text = `SKU: ${content.sku}`;
                        break;
                    case 'price':
                        text = content.price;
                        fontStyle = 'Arial-Bold';
                        break;
                    case 'wholesalePrice':
                        text = `Wholesale: ${content.wholesalePrice}`;
                        break;
                    case 'category':
                        text = content.category;
                        break;
                    case 'stock':
                        text = `Stock: ${content.stock}`;
                        break;
                    default:
                        text = content[field] || '';
                }

                if (text) {
                    doc.font(this.getFontFamily(fontStyle))
                       .text(text, padding, currentY, {
                           width: labelSize.width - (2 * padding),
                           align: template.settings?.alignment || 'left'
                       });
                    currentY += lineHeight;
                }
            }
        });

        // Draw barcode if included
        if (fields.includes('barcode') && (content.barcode || content.sku)) {
            const barcodeText = content.barcode || content.sku;
            this.drawBarcode(doc, barcodeText, padding, currentY, labelSize.width - (2 * padding));
        }
    }

    /**
     * Draw custom label content
     */
    drawCustomLabel(doc, content, template, labelSize, padding) {
        const text = content.customText || '';
        const fontSize = template.settings?.fontSize || 12;
        
        // Center the text vertically and horizontally
        const textHeight = doc.heightOfString(text, {
            width: labelSize.width - (2 * padding)
        });
        
        const y = (labelSize.height - textHeight) / 2;
        
        doc.text(text, padding, y, {
            width: labelSize.width - (2 * padding),
            align: 'center'
        });
    }

    /**
     * Draw simple barcode representation
     */
    drawBarcode(doc, barcodeText, x, y, width) {
        const barcodeHeight = 20;
        const barWidth = 1;
        
        // Simple barcode representation with vertical lines
        for (let i = 0; i < Math.min(width / (barWidth + 1), barcodeText.length * 3); i++) {
            if (i % 2 === 0) {
                doc.rect(x + (i * (barWidth + 1)), y, barWidth, barcodeHeight).fill('#000000');
            }
        }
        
        // Add barcode text below
        doc.font('Courier')
           .fontSize(6)
           .text(barcodeText, x, y + barcodeHeight + 2, {
               width: width,
               align: 'center'
           });
    }

    /**
     * Get font family mapping
     */
    getFontFamily(fontName) {
        const fontMap = {
            'Arial': 'Helvetica',
            'Arial Bold': 'Helvetica-Bold',
            'Times New Roman': 'Times-Roman',
            'Courier New': 'Courier',
            'Helvetica': 'Helvetica'
        };
        return fontMap[fontName] || 'Helvetica';
    }

    /**
     * Truncate text to fit width
     */
    truncateText(doc, text, maxWidth) {
        if (doc.widthOfString(text) <= maxWidth) {
            return text;
        }
        
        let truncated = text;
        while (doc.widthOfString(truncated + '...') > maxWidth && truncated.length > 0) {
            truncated = truncated.slice(0, -1);
        }
        
        return truncated + '...';
    }

    /**
     * Add metadata footer
     */
    addMetadata(doc, labelCount, template, pageCount) {
        const footerY = doc.page.height - 20;
        const metadata = `Generated ${labelCount} labels using "${template.name}" template | ${new Date().toLocaleDateString()} | Page ${pageCount}`;
        
        doc.font('Helvetica')
           .fontSize(8)
           .fillColor('#666666')
           .text(metadata, this.pageMargin, footerY, {
               width: doc.page.width - (2 * this.pageMargin),
               align: 'center'
           });
    }
}

// Export service instance
const labelPDFService = new LabelPDFService();
module.exports = labelPDFService;