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

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Draw professional label with clean styling
     */
    drawLabel(doc, labelData, template, x, y, labelSize) {
        // Save graphics state
        doc.save();

        // Move to label position
        doc.translate(x, y);

        // Clean white background
        doc.rect(0, 0, labelSize.width, labelSize.height)
           .fill('#ffffff');

        // Professional border
        if (template.settings?.showBorder !== false) {
            const borderColor = template.settings?.borderColor || '#d1d5db';
            
            doc.rect(0, 0, labelSize.width, labelSize.height)
               .lineWidth(0.5)
               .stroke(borderColor);
        }

        // Set professional defaults
        const padding = Math.max(template.settings?.padding || 4, 4);

        // Draw label content
        if (labelData.type === 'product') {
            this.drawProductLabel(doc, labelData.content, template, labelSize, padding);
        } else if (labelData.type === 'custom') {
            this.drawCustomLabel(doc, labelData.content, template, labelSize, padding);
        }

        // Restore graphics state
        doc.restore();
    }

    /**
     * Draw professional product label content
     */
    drawProductLabel(doc, content, template, labelSize, padding) {
        const fields = template.fields || [];
        const baseFontSize = template.settings?.fontSize || 10;
        let currentY = padding + 2;

        // Calculate space allocation
        const barcodeHeight = fields.includes('barcode') ? 28 : 0;
        const availableTextHeight = labelSize.height - (2 * padding) - barcodeHeight - 4;
        const textFieldsCount = fields.filter(f => f !== 'barcode').length;
        
        // Optimized font sizing for professional appearance
        const adjustedFontSize = Math.min(baseFontSize, Math.max(8, Math.floor(availableTextHeight / (textFieldsCount * 1.4))));
        const lineHeight = adjustedFontSize + 1;

        // Draw text fields with clean hierarchy
        fields.forEach((field) => {
            if (field === 'barcode') return;
            
            if (content[field] && currentY < labelSize.height - padding - barcodeHeight) {
                let text = '';
                let fontStyle = 'Helvetica';
                let fontSize = adjustedFontSize;
                let textColor = '#000000';

                switch (field) {
                    case 'name':
                        text = this.truncateText(doc, content.name, labelSize.width - (2 * padding), 'Helvetica-Bold', fontSize + 1);
                        fontStyle = 'Helvetica-Bold';
                        fontSize = Math.min(adjustedFontSize + 1, baseFontSize + 1);
                        break;
                    case 'sku':
                        text = content.sku;
                        fontSize = Math.max(adjustedFontSize - 1, 7);
                        textColor = '#666666';
                        break;
                    case 'price':
                        text = content.price;
                        fontStyle = 'Helvetica-Bold';
                        fontSize = adjustedFontSize + 1;
                        textColor = '#1a5f1a';
                        break;
                    case 'category':
                        text = content.category;
                        fontSize = Math.max(adjustedFontSize - 1, 7);
                        textColor = '#555555';
                        break;
                    default:
                        text = content[field] || '';
                }

                if (text) {
                    doc.font(this.getFontFamily(fontStyle))
                       .fontSize(fontSize)
                       .fillColor(textColor)
                       .text(text, padding, currentY, {
                           width: labelSize.width - (2 * padding),
                           align: template.settings?.alignment || 'left'
                       });
                    currentY += lineHeight + 1;
                }
            }
        });

        // Draw barcode at bottom with proper spacing
        if (fields.includes('barcode') && (content.barcode || content.sku)) {
            const barcodeText = content.barcode || content.sku;
            const barcodeY = labelSize.height - padding - 26;
            this.drawBarcode(doc, barcodeText, padding, barcodeY, labelSize.width - (2 * padding));
        }
    }

    /**
     * Draw professional custom label content
     */
    drawCustomLabel(doc, content, template, labelSize, padding) {
        const text = content.customText || '';
        const baseFontSize = template.settings?.fontSize || 12;
        const textColor = template.settings?.textColor || '#000000';
        
        // Calculate optimal font size
        const maxWidth = labelSize.width - (2 * padding);
        let fontSize = baseFontSize;
        
        doc.font('Helvetica-Bold').fontSize(fontSize);
        while (doc.widthOfString(text) > maxWidth && fontSize > 8) {
            fontSize -= 1;
            doc.fontSize(fontSize);
        }
        
        // Center the text perfectly
        const textHeight = doc.heightOfString(text, {
            width: maxWidth,
            align: 'center'
        });
        
        const y = (labelSize.height - textHeight) / 2;
        
        // Draw clean text without background clutter
        doc.font('Helvetica-Bold')
           .fontSize(fontSize)
           .fillColor(textColor)
           .text(text, padding, y, {
               width: maxWidth,
               align: 'center'
           });
    }

    /**
     * Draw professional barcode representation
     */
    drawBarcode(doc, barcodeText, x, y, width) {
        const barcodeHeight = 20;
        const barWidth = 1.2;
        
        // Calculate barcode layout
        const availableWidth = width - 8; // Leave margins
        const barsCount = Math.floor(availableWidth / (barWidth + 0.3));
        const totalBarsWidth = barsCount * (barWidth + 0.3);
        const startX = x + (width - totalBarsWidth) / 2;
        
        // Generate clean barcode pattern
        for (let i = 0; i < barsCount; i++) {
            const charIndex = i % barcodeText.length;
            const charCode = barcodeText.charCodeAt(charIndex);
            const shouldDraw = (charCode % 3 !== 0) || (i % 4 === 1) || (i % 7 === 0);
            
            if (shouldDraw) {
                doc.rect(startX + (i * (barWidth + 0.3)), y, barWidth, barcodeHeight).fill('#000000');
            }
        }
        
        // Add guard bars for professional appearance
        doc.rect(startX - 3, y, 1, barcodeHeight + 2).fill('#000000');
        doc.rect(startX + totalBarsWidth + 1, y, 1, barcodeHeight + 2).fill('#000000');
        
        // Add barcode text with clean styling
        doc.font('Helvetica')
           .fontSize(7)
           .fillColor('#333333')
           .text(barcodeText, x, y + barcodeHeight + 3, {
               width: width,
               align: 'center'
           });
    }

    /**
     * Get font family mapping with enhanced options
     */
    getFontFamily(fontName) {
        const fontMap = {
            'Arial': 'Helvetica',
            'Arial Bold': 'Helvetica-Bold',
            'Arial-Bold': 'Helvetica-Bold',
            'Times New Roman': 'Times-Roman',
            'Times-Roman': 'Times-Roman',
            'Courier New': 'Courier',
            'Courier': 'Courier',
            'Courier-Bold': 'Courier-Bold',
            'Helvetica': 'Helvetica',
            'Helvetica-Bold': 'Helvetica-Bold',
            'Helvetica-Oblique': 'Helvetica-Oblique',
            'Helvetica-BoldOblique': 'Helvetica-BoldOblique'
        };
        return fontMap[fontName] || 'Helvetica';
    }

    /**
     * Truncate text to fit width with smart truncation
     */
    truncateText(doc, text, maxWidth, font = 'Helvetica', fontSize = 10) {
        doc.font(font).fontSize(fontSize);
        
        if (doc.widthOfString(text) <= maxWidth) {
            return text;
        }
        
        // Try to break at word boundaries first
        const words = text.split(' ');
        if (words.length > 1) {
            let truncated = '';
            for (const word of words) {
                const testText = truncated ? `${truncated} ${word}` : word;
                if (doc.widthOfString(testText + '...') <= maxWidth) {
                    truncated = testText;
                } else {
                    break;
                }
            }
            if (truncated) {
                return truncated + '...';
            }
        }
        
        // Fallback to character-by-character truncation
        let truncated = text;
        while (doc.widthOfString(truncated + '...') > maxWidth && truncated.length > 0) {
            truncated = truncated.slice(0, -1);
        }
        
        return truncated + '...';
    }


}

// Export service instance
const labelPDFService = new LabelPDFService();
module.exports = labelPDFService;