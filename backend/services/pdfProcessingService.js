const pdfParse = require('pdf-parse');
const natural = require('natural');
const fs = require('fs');
const path = require('path');
const ocrProcessingService = require('./ocrProcessingService');
const templateRecognitionService = require('./templateRecognitionService');

/**
 * Enhanced PDF Processing Service with Smart Template Recognition
 * Handles various PDF formats and extracts product data using AI/ML techniques
 * Now includes OCR support and automatic template detection
 */
class PDFProcessingService {
    constructor() {
        // Common product field patterns (fallback)
        this.fieldPatterns = {
            name: /(?:product\s*name|item\s*name|description|title)[:\-\s]*([^\n\r\t]+)/gi,
            sku: /(?:sku|code|item\s*code|product\s*code|part\s*no|part\s*number)[:\-\s]*([A-Z0-9\-_]+)/gi,
            price: /(?:price|cost|rate|amount)[:\-\s]*[₹$£€]?([0-9,]+\.?[0-9]*)/gi,
            category: /(?:category|type|class|group)[:\-\s]*([^\n\r\t]+)/gi,
            brand: /(?:brand|manufacturer|make)[:\-\s]*([^\n\r\t]+)/gi,
            stock: /(?:stock|quantity|qty|inventory)[:\-\s]*([0-9,]+)/gi,
            barcode: /(?:barcode|upc|ean)[:\-\s]*([0-9]+)/gi,
            supplier: /(?:supplier|vendor|distributor)[:\-\s]*([^\n\r\t]+)/gi
        };

        // Performance metrics
        this.stats = {
            totalProcessed: 0,
            templatesDetected: 0,
            ocrEnhanced: 0,
            averageConfidence: 0
        };
    }

    /**
     * Main function to process PDF and extract product data
     * Enhanced with smart template recognition and OCR
     */
    async processPDF(filePath, options = {}) {
        const startTime = Date.now();
        
        try {
            // Read and parse PDF
            const dataBuffer = fs.readFileSync(filePath);
            const pdfData = await pdfParse(dataBuffer);
            
            // Extract text content
            let text = pdfData.text;
            let extractionMethod = 'text_based';
            let ocrUsed = false;
            let templateUsed = null;
            
            // Step 1: Template Recognition (Smart Detection)
            const templateResult = templateRecognitionService.detectTemplate(text);
            
            if (templateResult.hasTemplate) {
                templateUsed = templateResult.bestMatch;
                
                // Try template-specific extraction first
                const templateExtraction = await templateRecognitionService.applyTemplate(text, templateResult, options);
                
                if (templateExtraction.success && templateExtraction.products.length > 0) {
                    const processingTime = Date.now() - startTime;
                    this.updateStats(templateExtraction, true, false);
                    
                    return {
                        success: true,
                        data: {
                            totalPages: pdfData.numpages,
                            extractedText: this.truncateText(text),
                            products: templateExtraction.products.map(p => this.standardizeProduct(p)),
                            summary: {
                                totalProducts: templateExtraction.products.length,
                                confidence: templateExtraction.confidence,
                                method: templateExtraction.method,
                                templateName: templateExtraction.templateName,
                                templateConfidence: templateExtraction.templateConfidence,
                                extractionMethod: 'template_based',
                                ocrUsed: false,
                                processingTime: processingTime + 'ms',
                                fieldsFound: this.analyzeFieldCoverage(templateExtraction.products)
                            },
                            extractionMethod: templateExtraction.method
                        }
                    };
                }
            }
            
            // Step 2: Check if OCR is needed
            const imageDetection = await ocrProcessingService.detectImageContent(text);
            
            if (imageDetection.isLikelyImageBased && options.enableOCR !== false) {
                
                try {
                    const ocrResult = await this.enhanceTextWithOCR(text, filePath);
                    if (ocrResult.success) {
                        text = ocrResult.enhancedText;
                        extractionMethod = 'ocr_enhanced';
                        ocrUsed = true;
                    }
                } catch (ocrError) {
                    console.error('⚠️ OCR processing failed:', ocrError.message);
                }
            }
            
            // Step 3: Standard extraction methods
            const extractedData = await this.extractProductData(text, {
                ...options,
                ocrUsed,
                imageDetection,
                templateResult
            });
            
            const processingTime = Date.now() - startTime;
            this.updateStats(extractedData, templateUsed !== null, ocrUsed);
            
            return {
                success: true,
                data: {
                    totalPages: pdfData.numpages,
                    extractedText: this.truncateText(text),
                    products: extractedData.products,
                    summary: {
                        ...extractedData.summary,
                        extractionMethod,
                        ocrUsed,
                        templateUsed: templateUsed?.name || null,
                        templateConfidence: templateUsed?.confidence || null,
                        imageDetection,
                        processingTime: processingTime + 'ms'
                    },
                    extractionMethod: extractedData.method
                }
            };
        } catch (error) {
            console.error('❌ PDF Processing Error:', error);
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    }

    /**
     * Extract product data using multiple methods with prioritization
     */
    async extractProductData(text, options = {}) {
        const methods = [
            { method: this.extractTableFormat.bind(this), priority: 1, name: 'table_format' },
            { method: this.extractInvoiceFormat.bind(this), priority: 2, name: 'invoice_format' },
            { method: this.extractListFormat.bind(this), priority: 3, name: 'list_format' },
            { method: this.extractCatalogFormat.bind(this), priority: 4, name: 'catalog_format' }
        ];

        // If OCR was used, prioritize OCR-specific methods
        if (options.ocrUsed) {
            methods.unshift({ 
                method: this.extractOCRFormat.bind(this), 
                priority: 0, 
                name: 'ocr_enhanced' 
            });
        }

        // Sort by priority
        methods.sort((a, b) => a.priority - b.priority);

        let bestResult = { products: [], confidence: 0, method: 'unknown' };
        const results = [];

        for (const { method, name } of methods) {
            try {
                console.log(`🔍 Trying ${name} extraction...`);
                const result = await method(text, options);
                
                result.method = name;
                results.push(result);
                
                if (result.confidence > bestResult.confidence) {
                    bestResult = result;
                }
                
                console.log(`✓ ${name}: ${result.products.length} products, ${Math.round(result.confidence * 100)}% confidence`);
                
                // Early exit if we have high confidence
                if (result.confidence > 0.8 && result.products.length > 0) {
                    console.log(`🎯 High confidence result found with ${name}`);
                    break;
                }
            } catch (error) {
                console.error(`⚠️ ${name} extraction failed:`, error.message);
            }
        }


        return {
            products: bestResult.products,
            summary: {
                totalProducts: bestResult.products.length,
                confidence: bestResult.confidence,
                method: bestResult.method,
                fieldsFound: this.analyzeFieldCoverage(bestResult.products),
                allResults: results.map(r => ({
                    method: r.method,
                    productCount: r.products.length,
                    confidence: r.confidence
                }))
            },
            method: bestResult.method
        };
    }

    /**
     * Enhanced OCR format extraction
     */
    async extractOCRFormat(text, options) {
        
        const products = ocrProcessingService.extractProductsFromOCRText(text);
        const standardizedProducts = products.map(product => this.standardizeProduct(product));
        
        const confidence = products.length > 0 ? 0.85 : 0.1;
        
        return {
            products: standardizedProducts,
            confidence,
            method: 'ocr_enhanced'
        };
    }

    /**
     * Enhanced table format extraction with better parsing
     */
    async extractTableFormat(text, options) {
        
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        const products = [];
        let headers = [];
        let headerFound = false;
        
        // Enhanced header detection
        for (let i = 0; i < Math.min(25, lines.length); i++) {
            const line = lines[i].toLowerCase();
            if (this.containsProductHeaders(line)) {
                headers = this.parseHeaders(lines[i]);
                headerFound = true;
                
                
                // Process table rows with better parsing
                for (let j = i + 1; j < lines.length && j < i + 200; j++) { // Limit rows to prevent runaway
                    const rowData = this.parseTableRow(lines[j], headers);
                    if (rowData && this.isValidProductRow(rowData)) {
                        products.push(this.standardizeProduct(rowData));
                    }
                }
                break;
            }
        }

        const confidence = headerFound ? 0.9 : 0.3;
        
        return {
            products,
            confidence,
            method: 'table_format'
        };
    }

    /**
     * Enhanced list format extraction
     */
    async extractListFormat(text, options) {
        
        const products = [];
        const blocks = this.smartBlockSplit(text);
        
        console.log(`📦 Split text into ${blocks.length} product blocks`);
        
        for (const block of blocks) {
            const product = this.extractFromTextBlock(block);
            if (product && this.isValidProduct(product)) {
                products.push(this.standardizeProduct(product));
            }
        }

        return {
            products,
            confidence: products.length > 0 ? 0.75 : 0.2,
            method: 'list_format'
        };
    }

    /**
     * Enhanced invoice format extraction
     */
    async extractInvoiceFormat(text, options) {
        
        const products = [];
        const lines = text.split('\n');
        let inItemSection = false;
        let itemCount = 0;
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            if (this.isItemSectionStart(trimmed)) {
                inItemSection = true;
                continue;
            }
            
            if (this.isItemSectionEnd(trimmed)) {
                inItemSection = false;
                continue;
            }
            
            if (inItemSection && trimmed.length > 5) {
                const product = this.extractInvoiceItem(trimmed);
                if (product && this.isValidProduct(product)) {
                    products.push(this.standardizeProduct(product));
                    itemCount++;
                }
            }
        }

        return {
            products,
            confidence: products.length > 0 ? 0.8 : 0.1,
            method: 'invoice_format'
        };
    }

    /**
     * Enhanced catalog format extraction
     */
    async extractCatalogFormat(text, options) {
        
        const products = [];
        const sections = this.smartCatalogSplit(text);
        
        console.log(`📂 Split catalog into ${sections.length} sections`);
        
        for (const section of sections) {
            const sectionProducts = this.extractCatalogSection(section);
            products.push(...sectionProducts);
        }

        return {
            products: products.map(p => this.standardizeProduct(p)),
            confidence: products.length > 0 ? 0.65 : 0.1,
            method: 'catalog_format'
        };
    }

    // Enhanced helper methods

    smartBlockSplit(text) {
        // More intelligent block splitting
        const patterns = [
            /\n\s*\n\s*/, // Double newlines
            /\n[-=_]{3,}\n/, // Separator lines
            /\n\*{3,}\n/, // Asterisk separators
            /\n\d+\.\s/, // Numbered items
            /\n[A-Z][A-Z\s]{10,}\n/ // Section headers
        ];
        
        let blocks = [text];
        
        for (const pattern of patterns) {
            const newBlocks = [];
            for (const block of blocks) {
                newBlocks.push(...block.split(pattern));
            }
            blocks = newBlocks;
        }
        
        return blocks.filter(block => block.trim().length > 25);
    }

    smartCatalogSplit(text) {
        // Enhanced catalog section splitting
        return text.split(/(?:\n|^)(?=[A-Z][A-Z\s]{8,}\n)|(?:\n){3,}/)
                  .filter(section => section.trim().length > 50);
    }

    enhanceTextWithOCR(originalText, pdfPath) {
        // OCR enhancement implementation
        return ocrProcessingService.processImageContent(originalText);
    }

    // Standard helper methods (enhanced versions)

    containsProductHeaders(line) {
        const productHeaders = ['name', 'item', 'product', 'description', 'sku', 'code', 'price', 'qty', 'quantity', 'stock'];
        const lowerLine = line.toLowerCase();
        const matches = productHeaders.filter(header => lowerLine.includes(header)).length;
        return matches >= 2;
    }

    parseHeaders(headerLine) {
        // Enhanced header parsing with multiple delimiters
        let headers;
        
        if (headerLine.includes('\t')) {
            headers = headerLine.split('\t');
        } else if (headerLine.includes('|')) {
            headers = headerLine.split('|');
        } else if (headerLine.match(/\s{3,}/)) {
            headers = headerLine.split(/\s{3,}/);
        } else {
            headers = headerLine.split(/[,;]|(?<=\w)\s+(?=[A-Z])/);
        }
        
        return headers.map(h => h.trim().toLowerCase()).map(header => {
            if (header.includes('name') || header.includes('item') || header.includes('product') || header.includes('description')) return 'name';
            if (header.includes('sku') || header.includes('code') || header.includes('part')) return 'sku';
            if (header.includes('price') || header.includes('cost') || header.includes('rate') || header.includes('amount')) return 'price';
            if (header.includes('qty') || header.includes('quantity') || header.includes('stock') || header.includes('inventory')) return 'stock';
            if (header.includes('category') || header.includes('type') || header.includes('class')) return 'category';
            if (header.includes('brand') || header.includes('manufacturer') || header.includes('make')) return 'brand';
            return header;
        });
    }

    parseTableRow(line, headers) {
        if (!line || !headers.length) return null;
        
        let values;
        
        // Enhanced row parsing with multiple delimiter support
        if (line.includes('\t')) {
            values = line.split('\t');
        } else if (line.includes('|')) {
            values = line.split('|');
        } else if (line.match(/\s{3,}/)) {
            values = line.split(/\s{3,}/);
        } else if (line.includes(',') && line.split(',').length >= headers.length) {
            values = line.split(',');
        } else {
            // Fallback: try to split by position estimation
            const avgSpacing = Math.floor(line.length / headers.length);
            values = [];
            for (let i = 0; i < headers.length; i++) {
                const start = i * avgSpacing;
                const end = (i + 1) * avgSpacing;
                values.push(line.substring(start, end).trim());
            }
        }
        
        values = values.map(v => v.trim()).filter(v => v);
        
        const product = {};
        for (let i = 0; i < Math.min(headers.length, values.length); i++) {
            if (headers[i] && values[i]) {
                product[headers[i]] = values[i];
            }
        }
        
        return Object.keys(product).length > 1 ? product : null;
    }

    extractFromTextBlock(block) {
        const product = {};
        
        // Use regex patterns to extract fields
        for (const [field, pattern] of Object.entries(this.fieldPatterns)) {
            const matches = [...block.matchAll(pattern)];
            if (matches.length > 0) {
                product[field] = matches[0][1].trim();
            }
        }
        
        // Enhanced number extraction for prices/quantities
        const numbers = block.match(/\b\d+(?:,\d{3})*(?:\.\d{2})?\b/g) || [];
        if (numbers.length > 0 && !product.price) {
            // More sophisticated price detection
            const prices = numbers.map(n => parseFloat(n.replace(/,/g, '')))
                                  .filter(n => n > 0 && n < 1000000); // Reasonable price range
            
            if (prices.length > 0) {
                // Choose most likely price (not too small, not too large)
                const sortedPrices = prices.sort((a, b) => b - a);
                product.price = sortedPrices.find(p => p >= 1 && p <= 50000) || sortedPrices[0];
            }
        }
        
        return product;
    }

    isItemSectionStart(line) {
        const starters = ['item', 'product', 'description', 'qty', 'sr.', 'sl.', 's.no', 'order details', 'items ordered'];
        const lowerLine = line.toLowerCase();
        return starters.some(starter => lowerLine.includes(starter)) && 
               (lowerLine.includes('price') || lowerLine.includes('amount'));
    }

    isItemSectionEnd(line) {
        const enders = ['total', 'subtotal', 'grand total', 'amount due', 'tax', 'discount', 'payment', 'thank you'];
        return enders.some(ender => line.toLowerCase().includes(ender));
    }

    extractInvoiceItem(line) {
        // Enhanced invoice item parsing
        const parts = line.split(/\s{2,}|\t/).filter(part => part.trim());
        
        if (parts.length >= 2) {
            let name = parts[0];
            let price = null;
            let quantity = 1;
            
            // Find price in any part
            for (const part of parts) {
                const priceMatch = part.match(/[₹$£€]?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
                if (priceMatch) {
                    const foundPrice = parseFloat(priceMatch[1].replace(/,/g, ''));
                    if (foundPrice > 0) {
                        price = foundPrice;
                        break;
                    }
                }
            }
            
            // Find quantity
            const qtyMatch = line.match(/(\d+)\s*x|qty[:\s]*(\d+)/i);
            if (qtyMatch) {
                quantity = parseInt(qtyMatch[1] || qtyMatch[2]);
            }
            
            if (name && name.length > 2) {
                return {
                    name,
                    sellingPrice: price || 0,
                    currentStock: quantity,
                    sku: this.generateSKU(name)
                };
            }
        }
        
        return null;
    }

    extractCatalogSection(section) {
        const products = [];
        const lines = section.split('\n').filter(line => line.trim());
        let currentProduct = {};
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            if (trimmed.length < 3) continue;
            
            if (this.looksLikeProductStart(trimmed)) {
                if (Object.keys(currentProduct).length > 1) {
                    products.push({ ...currentProduct });
                }
                currentProduct = { name: trimmed };
            } else {
                this.addProductInfo(currentProduct, trimmed);
            }
        }
        
        if (Object.keys(currentProduct).length > 1) {
            products.push(currentProduct);
        }
        
        return products.filter(p => this.isValidProduct(p));
    }

    looksLikeProductStart(line) {
        return line.length > 5 && 
               line.length < 120 && 
               !/^\d+\.?\d*$/.test(line) && 
               !line.toLowerCase().match(/^(page|total|subtotal|tax|shipping|continue|www\.|http)/);
    }

    addProductInfo(product, line) {
        // Enhanced product info extraction
        
        // Price extraction with multiple currencies
        const priceMatch = line.match(/(?:price|cost|rate)[:\s]*([₹$£€¥]\s*\d+(?:[,.]\d{2,3})*(?:\.\d{2})?)|([₹$£€¥]\s*\d+(?:[,.]\d{3})*(?:\.\d{2})?)/i);
        if (priceMatch && !product.price) {
            const priceStr = (priceMatch[1] || priceMatch[2]).replace(/[₹$£€¥,\s]/g, '');
            const price = parseFloat(priceStr);
            if (price > 0 && price < 1000000) {
                product.price = price;
            }
        }
        
        // SKU extraction
        const skuMatch = line.match(/(?:sku|code|item\s*#|part\s*(?:no|number))[:\s]*([A-Z0-9\-_.]{3,20})/i);
        if (skuMatch && !product.sku) {
            product.sku = skuMatch[1];
        }
        
        // Category extraction
        const categoryMatch = line.match(/(?:category|type|class)[:\s]*([a-zA-Z\s&-]+)/i);
        if (categoryMatch && !product.category) {
            product.category = categoryMatch[1].trim();
        }
        
        // Brand extraction
        const brandMatch = line.match(/(?:brand|make|manufacturer)[:\s]*([a-zA-Z\s&-]+)/i);
        if (brandMatch && !product.brand) {
            product.brand = brandMatch[1].trim();
        }
        
        // Description (if not too short or too long)
        if (!product.description && line.length >= 15 && line.length <= 200 && 
            !line.match(/^\d+$/) && !line.toLowerCase().includes('page')) {
            product.description = line;
        }
    }

    standardizeProduct(product) {
        const standardized = {
            name: product.name || product.description || 'Unknown Product',
            sku: product.sku || this.generateSKU(product.name || 'PROD'),
            costPrice: this.parsePrice(product.cost || product.costPrice) || 0,
            sellingPrice: this.parsePrice(product.price || product.sellingPrice) || 0,
            currentStock: this.parseNumber(product.stock || product.quantity || product.qty) || 0,
            minStockLevel: 10,
            category: product.category || 'Imported',
            brand: product.brand || '',
            description: product.description || '',
            barcode: product.barcode || '',
            supplier: {
                name: product.supplier || 'PDF Import',
                contact: '',
                email: '',
                address: ''
            },
            isActive: true
        };

        // Ensure reasonable pricing
        if (standardized.costPrice > 0 && standardized.sellingPrice === 0) {
            standardized.sellingPrice = standardized.costPrice * 1.3; // 30% markup
        } else if (standardized.sellingPrice > 0 && standardized.costPrice === 0) {
            standardized.costPrice = standardized.sellingPrice * 0.7; // Estimate cost
        } else if (standardized.sellingPrice < standardized.costPrice && standardized.costPrice > 0) {
            standardized.sellingPrice = standardized.costPrice * 1.2; // 20% markup
        }

        return standardized;
    }

    // Utility methods

    generateSKU(name) {
        if (!name) return 'SKU' + Date.now();
        
        const cleaned = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const timestamp = Date.now().toString().slice(-4);
        const randomSuffix = Math.random().toString(36).substring(2, 4).toUpperCase();
        return (cleaned.substring(0, 4) + timestamp + randomSuffix).padEnd(10, '0');
    }

    parsePrice(priceStr) {
        if (typeof priceStr === 'number') return priceStr;
        if (!priceStr) return 0;
        
        const cleaned = priceStr.toString().replace(/[₹$£€¥,\s]/g, '');
        const number = parseFloat(cleaned);
        return isNaN(number) ? 0 : Math.max(0, number);
    }

    parseNumber(numStr) {
        if (typeof numStr === 'number') return numStr;
        if (!numStr) return 0;
        
        const cleaned = numStr.toString().replace(/[,\s]/g, '');
        const number = parseInt(cleaned);
        return isNaN(number) ? 0 : Math.max(0, number);
    }

    extractNumber(str) {
        if (!str) return null;
        const match = str.match(/\d+(?:\.\d+)?/);
        return match ? parseFloat(match[0]) : null;
    }

    isValidProductRow(product) {
        return product && 
               (product.name || product.description) && 
               product.name !== '' &&
               (product.price || product.cost || product.sellingPrice || product.sku);
    }

    isValidProduct(product) {
        return product && 
               Object.keys(product).length >= 2 && 
               (product.name || product.description) &&
               product.name !== '' &&
               product.name.length >= 2;
    }

    analyzeFieldCoverage(products) {
        if (products.length === 0) return {};
        
        const fields = ['name', 'sku', 'sellingPrice', 'currentStock', 'category', 'brand', 'description'];
        const coverage = {};
        
        fields.forEach(field => {
            const hasField = products.filter(p => {
                const value = p[field];
                return value && value !== '' && value !== 0;
            }).length;
            
            coverage[field] = {
                count: hasField,
                percentage: Math.round((hasField / products.length) * 100)
            };
        });
        
        return coverage;
    }

    truncateText(text, maxLength = 2000) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    updateStats(extractionResult, templateUsed, ocrUsed) {
        this.stats.totalProcessed++;
        if (templateUsed) this.stats.templatesDetected++;
        if (ocrUsed) this.stats.ocrEnhanced++;
        
        const confidence = extractionResult.confidence || 0;
        this.stats.averageConfidence = 
            (this.stats.averageConfidence * (this.stats.totalProcessed - 1) + confidence) / this.stats.totalProcessed;
    }

    getStats() {
        return {
            ...this.stats,
            averageConfidence: Math.round(this.stats.averageConfidence * 100) + '%',
            templateDetectionRate: Math.round((this.stats.templatesDetected / this.stats.totalProcessed) * 100) + '%',
            ocrUsageRate: Math.round((this.stats.ocrEnhanced / this.stats.totalProcessed) * 100) + '%'
        };
    }

    cleanup(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            console.error('⚠️ Cleanup error:', error.message);
        }
    }
}

module.exports = new PDFProcessingService();
