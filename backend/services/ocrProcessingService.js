const Tesseract = require('tesseract.js');
const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

/**
 * Enhanced OCR Processing Service for Scanned PDFs
 * Handles image-based PDFs and applies OCR to extract text
 */
class OCRProcessingService {
    constructor() {
        this.ocrOptions = {
            logger: m => console.log('OCR Progress:', m.progress * 100 + '%'),
            tessdata: path.join(__dirname, '../tessdata') // Tesseract data path
        };
    }

    /**
     * Process image-based PDF content using OCR
     */
    async processImageContent(imagePath, options = {}) {
        try {
            console.log('Starting OCR processing for:', imagePath);

            // Pre-process image for better OCR results
            const processedImagePath = await this.preprocessImage(imagePath);

            // Run OCR on the processed image
            const { data: { text } } = await Tesseract.recognize(
                processedImagePath,
                'eng',
                {
                    ...this.ocrOptions,
                    ...options
                }
            );

            // Clean up processed image
            if (processedImagePath !== imagePath) {
                try {
                    fs.unlinkSync(processedImagePath);
                } catch (cleanupError) {
                    console.error('OCR cleanup error:', cleanupError.message);
                }
            }

            return {
                success: true,
                extractedText: text,
                confidence: this.calculateOCRConfidence(text)
            };

        } catch (error) {
            console.error('OCR processing error:', error);
            return {
                success: false,
                error: error.message,
                extractedText: ''
            };
        }
    }

    /**
     * Preprocess image to improve OCR accuracy
     */
    async preprocessImage(imagePath) {
        try {
            const image = await Jimp.read(imagePath);
            
            // Apply image enhancements for better OCR
            const enhanced = image
                .greyscale() // Convert to grayscale
                .contrast(0.3) // Increase contrast
                .normalize() // Normalize histogram
                .resize(image.bitmap.width * 2, image.bitmap.height * 2, Jimp.RESIZE_BICUBIC); // Upscale for better recognition

            const processedPath = imagePath.replace(/\.[^.]+$/, '_processed.png');
            await enhanced.writeAsync(processedPath);
            
            return processedPath;
        } catch (error) {
            console.error('Image preprocessing error:', error);
            return imagePath; // Return original if processing fails
        }
    }

    /**
     * Calculate confidence score based on extracted text quality
     */
    calculateOCRConfidence(text) {
        if (!text || text.trim().length === 0) return 0;

        let score = 0.5; // Base score

        // Check for product-related keywords
        const productKeywords = ['product', 'item', 'name', 'price', 'sku', 'code', 'quantity', 'stock'];
        const foundKeywords = productKeywords.filter(keyword => 
            text.toLowerCase().includes(keyword)
        ).length;
        
        score += (foundKeywords / productKeywords.length) * 0.3;

        // Check for numeric patterns (prices, quantities)
        const numberMatches = text.match(/\d+\.?\d*/g) || [];
        if (numberMatches.length > 0) {
            score += Math.min(numberMatches.length / 10, 0.2);
        }

        // Check text quality (ratio of alphanumeric to special characters)
        const alphanumeric = (text.match(/[a-zA-Z0-9]/g) || []).length;
        const total = text.length;
        const qualityRatio = total > 0 ? alphanumeric / total : 0;
        
        score *= qualityRatio;

        return Math.min(Math.max(score, 0), 1);
    }

    /**
     * Detect if PDF likely contains scanned images
     */
    async detectImageContent(pdfText) {
        // Heuristics to detect if PDF might be image-based
        const textLength = pdfText.trim().length;
        const wordCount = pdfText.trim().split(/\s+/).length;
        
        // If very little text extracted, likely image-based
        const isLikelyImage = textLength < 100 || wordCount < 20;
        
        // Check for garbled text patterns common in image-based PDFs
        const garbledPatterns = /[^\w\s\.\,\-\(\)\[\]]/g;
        const garbledRatio = (pdfText.match(garbledPatterns) || []).length / textLength;
        const isGarbled = garbledRatio > 0.3;

        return {
            isLikelyImageBased: isLikelyImage || isGarbled,
            confidence: isLikelyImage ? 0.8 : isGarbled ? 0.6 : 0.2,
            textLength,
            wordCount,
            garbledRatio
        };
    }

    /**
     * Extract structured data from OCR text
     */
    extractProductsFromOCRText(ocrText) {
        const products = [];
        const lines = ocrText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        // Look for table-like structures in OCR text
        const tableData = this.extractTableFromOCR(lines);
        if (tableData.length > 0) {
            products.push(...tableData);
        }
        
        // Look for list-like structures
        const listData = this.extractListFromOCR(lines);
        if (listData.length > 0) {
            products.push(...listData);
        }
        
        return products;
    }

    /**
     * Extract table data from OCR text
     */
    extractTableFromOCR(lines) {
        const products = [];
        let headers = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Detect header row
            if (this.looksLikeTableHeader(line)) {
                headers = this.parseOCRHeaders(line);
                continue;
            }
            
            // Process data rows
            if (headers.length > 0 && this.looksLikeTableRow(line, headers.length)) {
                const product = this.parseOCRTableRow(line, headers);
                if (product && this.isValidOCRProduct(product)) {
                    products.push(product);
                }
            }
        }
        
        return products;
    }

    /**
     * Extract list data from OCR text
     */
    extractListFromOCR(lines) {
        const products = [];
        let currentProduct = {};
        
        for (const line of lines) {
            // Skip very short or invalid lines
            if (line.length < 3) continue;
            
            // Check if this starts a new product
            if (this.looksLikeProductName(line)) {
                if (Object.keys(currentProduct).length > 0) {
                    products.push({ ...currentProduct });
                }
                currentProduct = { name: this.cleanOCRText(line) };
            } else {
                // Try to extract additional product information
                this.extractProductInfoFromOCRLine(currentProduct, line);
            }
        }
        
        // Don't forget the last product
        if (Object.keys(currentProduct).length > 0) {
            products.push(currentProduct);
        }
        
        return products.filter(p => this.isValidOCRProduct(p));
    }

    /**
     * Helper methods for OCR processing
     */
    
    looksLikeTableHeader(line) {
        const headerWords = ['name', 'item', 'product', 'sku', 'code', 'price', 'qty', 'quantity', 'stock'];
        const lowerLine = line.toLowerCase();
        return headerWords.filter(word => lowerLine.includes(word)).length >= 2;
    }

    parseOCRHeaders(line) {
        // OCR might not preserve exact spacing, so be flexible with separation
        const parts = line.split(/\s{2,}|\t/).map(h => h.trim().toLowerCase());
        
        return parts.map(header => {
            if (header.includes('name') || header.includes('item') || header.includes('product')) return 'name';
            if (header.includes('sku') || header.includes('code')) return 'sku';
            if (header.includes('price') || header.includes('cost') || header.includes('rate')) return 'price';
            if (header.includes('qty') || header.includes('quantity') || header.includes('stock')) return 'stock';
            if (header.includes('category') || header.includes('type')) return 'category';
            return header;
        });
    }

    looksLikeTableRow(line, expectedColumns) {
        const parts = line.split(/\s{2,}|\t/).filter(p => p.trim());
        return parts.length >= Math.max(2, expectedColumns - 1); // Allow some flexibility
    }

    parseOCRTableRow(line, headers) {
        const values = line.split(/\s{2,}|\t/).map(v => this.cleanOCRText(v));
        const product = {};
        
        for (let i = 0; i < Math.min(headers.length, values.length); i++) {
            if (headers[i] && values[i]) {
                product[headers[i]] = values[i];
            }
        }
        
        return Object.keys(product).length > 0 ? product : null;
    }

    looksLikeProductName(line) {
        // Heuristics for product names in OCR text
        return line.length > 5 && 
               line.length < 100 && 
               !/^\d+\.?\d*$/.test(line.trim()) && // Not just a number
               !line.toLowerCase().includes('page') && // Not a page reference
               !line.match(/^[^a-zA-Z]*$/); // Contains some letters
    }

    extractProductInfoFromOCRLine(product, line) {
        const cleanLine = this.cleanOCRText(line);
        
        // Try to extract price
        const priceMatch = cleanLine.match(/(?:price|cost|rate)[:\-\s]*[₹$£€]?\s*(\d+\.?\d*)/i);
        if (priceMatch && !product.price) {
            product.price = parseFloat(priceMatch[1]);
        }
        
        // Try to extract SKU
        const skuMatch = cleanLine.match(/(?:sku|code)[:\-\s]*([A-Z0-9\-_]+)/i);
        if (skuMatch && !product.sku) {
            product.sku = skuMatch[1];
        }
        
        // Try to extract quantity
        const qtyMatch = cleanLine.match(/(?:qty|quantity|stock)[:\-\s]*(\d+)/i);
        if (qtyMatch && !product.stock) {
            product.stock = parseInt(qtyMatch[1]);
        }
        
        // If no specific field found and line looks informative, add as description
        if (!product.description && cleanLine.length > 10 && cleanLine.length < 200) {
            product.description = cleanLine;
        }
    }

    cleanOCRText(text) {
        if (!text) return '';
        
        return text
            .replace(/[^\w\s\.\,\-\(\)\[\]₹$£€]/g, ' ') // Remove OCR artifacts
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
    }

    isValidOCRProduct(product) {
        return product && 
               (product.name || product.description) && 
               product.name !== '' && 
               Object.keys(product).length >= 1;
    }

    /**
     * Cleanup resources
     */
    async cleanup() {
        try {
            await Tesseract.terminate();
        } catch (error) {
            console.error('OCR cleanup error:', error.message);
        }
    }
}

module.exports = new OCRProcessingService();
