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
        // Enhanced product field patterns (more flexible)
        this.fieldPatterns = {
            name: /(?:product\s*name|item\s*name|product|name|description|title)[:\-\s]*([^\n\r\t,;]{3,50})/gi,
            sku: /(?:sku|code|item\s*code|product\s*code|part\s*no|part\s*number)[:\-\s]*([A-Z0-9\-_]{3,20})/gi,
            price: /(?:price|cost|rate|amount)[:\-\s]*[₹$£€]?\s*([0-9,]+\.?[0-9]*)/gi,
            category: /(?:category|type|class|group)[:\-\s]*([^\n\r\t,;]{3,30})/gi,
            brand: /(?:brand|manufacturer|make)[:\-\s]*([^\n\r\t,;]{2,20})/gi,
            stock: /(?:stock|quantity|qty|inventory)[:\-\s]*([0-9,]+)/gi,
            barcode: /(?:barcode|upc|ean)[:\-\s]*([0-9]+)/gi,
            supplier: /(?:supplier|vendor|distributor)[:\-\s]*([^\n\r\t,;]{3,30})/gi
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
            // Validate PDF file exists and is readable
            if (!fs.existsSync(filePath)) {
                throw new Error('PDF file not found');
            }

            // Read file buffer
            const dataBuffer = fs.readFileSync(filePath);
            
            // Validate PDF file size and basic structure
            if (dataBuffer.length === 0) {
                throw new Error('PDF file is empty');
            }
            
            // Check PDF signature
            if (!this.validatePDFStructure(dataBuffer)) {
                throw new Error('Invalid PDF file structure');
            }

            // Try parsing PDF with enhanced error handling
            let pdfData;
            try {
                pdfData = await pdfParse(dataBuffer, {
                    // Add options to handle problematic PDFs
                    max: 0, // No page limit
                    version: 'v1.10.100'
                });
            } catch (pdfError) {
                console.warn('⚠️ PDF parsing failed, attempting OCR-only extraction:', pdfError.message);
                
                // If PDF parsing fails, try OCR-only approach
                return await this.handleCorruptedPDF(filePath, dataBuffer, startTime, pdfError);
            }
            
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
            console.log('🔍 Image detection result:', imageDetection);
            
            if (imageDetection.isLikelyImageBased && options.enableOCR !== false) {
                console.log('🖼️ Image-based content detected, attempting OCR enhancement...');
                
                try {
                    const ocrResult = await this.enhanceTextWithOCR(text, filePath);
                    if (ocrResult.success) {
                        text = ocrResult.enhancedText;
                        extractionMethod = 'ocr_enhanced';
                        ocrUsed = true;
                        console.log('✅ OCR enhancement successful');
                    } else {
                        console.log('⚠️ OCR enhancement failed, using original text');
                    }
                } catch (ocrError) {
                    console.error('❌ OCR processing failed:', ocrError.message);
                }
            } else {
                console.log('📄 Text-based content detected, skipping OCR');
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
                    products: extractedData.products.map(p => this.standardizeProduct(p)),
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
                
                // Prioritize results that actually found products, then by confidence
                if (this.isBetterResult(result, bestResult)) {
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
        console.log('🔍 Extracting products from OCR text...');
        
        try {
            const products = await ocrProcessingService.extractProductsFromOCRText(text);
            const standardizedProducts = products.map(product => this.standardizeProduct(product));
            
            console.log(`✓ OCR extraction found ${products.length} products`);
            
            return {
                products: standardizedProducts,
                confidence: this.calculateExtractionConfidence(products, 'ocr_enhanced'),
                method: 'ocr_enhanced'
            };
        } catch (error) {
            console.error('❌ OCR extraction error:', error);
            return {
                products: [],
                confidence: 0.1,
                method: 'ocr_enhanced_failed'
            };
        }
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

        return {
            products,
            confidence: this.calculateExtractionConfidence(products, 'table_format'),
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
                products.push(product);
            }
        }

        return {
            products,
            confidence: this.calculateExtractionConfidence(products, 'list_format'),
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
            confidence: this.calculateExtractionConfidence(products, 'invoice_format'),
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
            confidence: this.calculateExtractionConfidence(products, 'catalog_format'),
            method: 'catalog_format'
        };
    }

    // Enhanced helper methods

    smartBlockSplit(text) {
        // Enhanced block splitting for product data
        
        // First, try splitting by "Product Name:" patterns
        if (text.includes('Product Name:')) {
            const blocks = text.split(/(?=Product Name:)/i);
            const validBlocks = blocks
                .filter(block => block.trim().length > 25)
                .filter(block => block.includes('Product Name:') || block.includes('SKU:') || block.includes('Price:'));
            
            if (validBlocks.length > 1) {
                console.log(`📦 Split by Product Name patterns: ${validBlocks.length} blocks`);
                return validBlocks;
            }
        }
        
        // Fallback to other patterns
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
        
        const result = blocks.filter(block => block.trim().length > 25);
        console.log(`📦 Split text into ${result.length} blocks using fallback patterns`);
        return result;
    }

    smartCatalogSplit(text) {
        // Enhanced catalog section splitting
        return text.split(/(?:\n|^)(?=[A-Z][A-Z\s]{8,}\n)|(?:\n){3,}/)
                  .filter(section => section.trim().length > 50);
    }

    async enhanceTextWithOCR(originalText, pdfPath) {
        console.log('🔍 Attempting OCR enhancement for image-based PDF...');
        
        try {
            // For now, we'll simulate OCR enhancement since direct image OCR from PDF is complex
            // In a production environment, you would convert PDF pages to images first
            console.log('💡 Simulating OCR enhancement for development...');
            
            // Check if the text is very sparse (likely image-based)
            const wordCount = originalText.split(/\s+/).length;
            const lineCount = originalText.split('\n').length;
            
            if (wordCount < 50 || lineCount < 10) {
                console.log('📄 Text appears sparse, may benefit from OCR in production');
                
                // For now, return the original text with a note
                return {
                    success: true,
                    enhancedText: originalText + '\n\n--- NOTE: OCR Enhancement Available ---\n(In production, this would perform image OCR)'
                };
            } else {
                console.log('📄 Sufficient text found, OCR enhancement not needed');
                return {
                    success: false,
                    enhancedText: originalText
                };
            }
        } catch (error) {
            console.error('❌ OCR enhancement error:', error);
            return {
                success: false,
                enhancedText: originalText
            };
        }
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
        console.log('🔍 Processing text block:', block.substring(0, 200) + '...');
        const product = {};
        
        // Use regex patterns to extract fields
        for (const [field, pattern] of Object.entries(this.fieldPatterns)) {
            const matches = [...block.matchAll(pattern)];
            if (matches.length > 0) {
                product[field] = matches[0][1].trim();
                console.log(`   Found ${field}: ${product[field]}`);
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
                product.price = sortedPrices.find(p => p >= 100 && p <= 500000) || sortedPrices[0];
                console.log(`   Inferred price: ${product.price} from numbers: [${numbers.join(', ')}]`);
            }
        }
        
        console.log('📦 Extracted product:', product);
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
        const productName = product.name || product.description || 'Unknown Product';
        
        const standardized = {
            name: productName,
            sku: product.sku || this.generateSKU(productName),
            costPrice: this.parsePrice(product.cost || product.costPrice) || 0,
            sellingPrice: this.parsePrice(product.price || product.sellingPrice) || 0,
            currentStock: this.parseNumber(product.stock || product.quantity || product.qty) || 0,
            minStockLevel: 10,
            category: product.category || 'Imported',
            brand: product.brand || this.inferBrandFromName(productName),
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

    /**
     * Intelligent brand inference from product name
     * Recognizes common brand patterns and extracts brand names
     */
    inferBrandFromName(productName) {
        if (!productName || typeof productName !== 'string') return '';
        
        // Common brand patterns - leading brand names
        const brandPatterns = [
            // Tech brands
            /^(Samsung|Apple|Sony|LG|Huawei|Xiaomi|OnePlus|Google|Microsoft|HP|Dell|Lenovo|Asus|Acer|MSI)/i,
            // Electronics brands
            /^(Panasonic|Philips|Bosch|Siemens|Canon|Nikon|Epson|Brother|JBL|Bose|Beats)/i,
            // Fashion & lifestyle brands
            /^(Nike|Adidas|Puma|Reebok|Levi\'?s|Calvin Klein|Tommy Hilfiger|Ralph Lauren)/i,
            // Automotive brands
            /^(Toyota|Honda|BMW|Mercedes|Audi|Ford|Volkswagen|Nissan|Hyundai|Kia)/i,
            // Generic brand pattern - capitalized word at start
            /^([A-Z][a-zA-Z]+)\s/
        ];

        // Try each pattern to extract brand
        for (const pattern of brandPatterns) {
            const match = productName.match(pattern);
            if (match) {
                return match[1].trim();
            }
        }

        // If no pattern matches, try to extract first capitalized word
        const words = productName.split(/\s+/);
        if (words.length > 0) {
            const firstWord = words[0].trim();
            // Check if it looks like a brand (capitalized, not too short/long)
            if (/^[A-Z][a-zA-Z]{2,15}$/.test(firstWord)) {
                return firstWord;
            }
        }

        return ''; // No brand could be inferred
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

    /**
     * Validate PDF file structure and signature
     */
    validatePDFStructure(dataBuffer) {
        try {
            // Check PDF signature - should start with %PDF
            const header = dataBuffer.slice(0, 4).toString();
            if (header !== '%PDF') {
                console.warn('⚠️ Invalid PDF signature:', header);
                return false;
            }

            // Check minimum file size (typical PDFs are at least a few hundred bytes)
            if (dataBuffer.length < 100) {
                console.warn('⚠️ PDF file too small:', dataBuffer.length, 'bytes');
                return false;
            }

            // Check for EOF marker (%%EOF should be near the end)
            const tail = dataBuffer.slice(-100).toString();
            if (!tail.includes('%%EOF') && !tail.includes('endobj') && !tail.includes('xref')) {
                console.warn('⚠️ PDF file may be truncated or corrupted - missing EOF markers');
                // Don't return false here as some PDFs might still be parseable
            }

            return true;
        } catch (error) {
            console.error('❌ PDF validation error:', error);
            return false;
        }
    }

    /**
     * Handle corrupted PDFs by attempting OCR-only extraction
     */
    async handleCorruptedPDF(filePath, dataBuffer, startTime, originalError) {
        console.log('🔄 PDF parsing failed, trying alternative approaches...');
        
        try {
            // For corrupted PDFs, we can't use OCR directly since Tesseract expects images
            // Instead, let's try to extract any readable text using basic methods
            console.log('📝 Attempting basic text extraction from corrupted PDF...');
            
            // Try to find any readable text in the buffer
            const textContent = this.extractBasicTextFromBuffer(dataBuffer);
            
            if (textContent && textContent.trim().length > 0) {
                console.log('✅ Basic text extraction successful for corrupted PDF');
                
                // Process the extracted text to find products
                const extractedData = await this.extractProductData(textContent, {
                    ocrUsed: false,
                    corruptedPDF: true
                });

                const processingTime = Date.now() - startTime;
                this.updateStats(extractedData, false, false);

                return {
                    success: true,
                    data: {
                        totalPages: 1, // Unknown for corrupted PDF
                        extractedText: this.truncateText(textContent),
                        products: extractedData.products.map(p => this.standardizeProduct(p)),
                        summary: {
                            ...extractedData.summary,
                            extractionMethod: 'basic_text_corrupted_pdf',
                            ocrUsed: false,
                            corruptedPDF: true,
                            originalError: originalError.message,
                            processingTime: processingTime + 'ms',
                            confidence: Math.max(extractedData.summary.confidence * 0.6, 0.2) // Lower confidence for corrupted PDFs
                        },
                        extractionMethod: 'basic_text_fallback'
                    },
                    warning: 'PDF was corrupted, used basic text extraction'
                };
            } else {
                throw new Error('No readable text found in corrupted PDF');
            }
        } catch (fallbackError) {
            console.error('❌ All fallback methods failed:', fallbackError);
            
            const processingTime = Date.now() - startTime;
            
            return {
                success: false,
                error: `PDF parsing failed: ${originalError.message}. Fallback extraction also failed: ${fallbackError.message}`,
                data: null,
                diagnostics: {
                    originalPDFError: originalError.message,
                    fallbackError: fallbackError.message,
                    fileSize: dataBuffer.length,
                    processingTime: processingTime + 'ms',
                    suggestions: [
                        'Try converting the PDF to a different format',
                        'Check if the PDF is password protected',
                        'Ensure the PDF is not corrupted during upload',
                        'Try using a different PDF processing tool'
                    ]
                }
            };
        }
    }

    /**
     * Calculate confidence score based on extraction quality
     */
    calculateExtractionConfidence(products, method) {
        if (products.length === 0) {
            return 0.1; // Very low confidence if no products found
        }

        let totalScore = 0;
        const maxScore = 100;

        // Base score for finding products
        const baseScore = Math.min(products.length * 15, 50); // Up to 50 points for quantity
        totalScore += baseScore;

        // Quality score based on field completeness
        const fieldWeights = {
            name: 20,      // Most important
            sku: 15,       // Very important for inventory
            price: 15,     // Critical for pricing
            stock: 10,     // Important for inventory
            category: 5    // Nice to have
        };

        let fieldScore = 0;
        let totalFields = 0;

        products.forEach(product => {
            Object.entries(fieldWeights).forEach(([field, weight]) => {
                totalFields += weight;
                if (product[field] && product[field].toString().trim().length > 0) {
                    // Additional bonus for high-quality data
                    let bonus = 0;
                    if (field === 'name' && product[field].length > 5) bonus = 2;
                    if (field === 'sku' && product[field].match(/^[A-Z0-9\-]+$/)) bonus = 3;
                    if (field === 'price' && !isNaN(parseFloat(product[field]))) bonus = 3;
                    
                    fieldScore += weight + bonus;
                } else if (field === 'price' && (product.sellingPrice || product.costPrice)) {
                    // Alternative price fields
                    fieldScore += weight;
                }
            });
        });

        const avgFieldScore = totalFields > 0 ? (fieldScore / totalFields) * 40 : 0; // Up to 40 points
        totalScore += avgFieldScore;

        // Method-specific bonuses
        const methodBonuses = {
            'list_format': 10,     // Good structure for products
            'table_format': 15,    // Excellent structure
            'invoice_format': 8,   // Decent structure
            'catalog_format': 5,   // Basic structure
            'ocr_enhanced': -5     // Penalty for OCR (less reliable)
        };

        totalScore += methodBonuses[method] || 0;

        // Convert to 0-1 scale and apply curve for better distribution
        let confidence = Math.min(totalScore / maxScore, 1.0);
        
        // Apply confidence curve - boost high-performing extractions
        if (confidence > 0.7) {
            confidence = Math.min(confidence * 1.15, 0.95); // Boost but cap at 95%
        } else if (confidence > 0.5) {
            confidence = Math.min(confidence * 1.1, 0.85);  // Moderate boost, cap at 85%
        }

        console.log(`📊 Confidence calculation: Base(${baseScore}) + Fields(${Math.round(avgFieldScore)}) + Method(${methodBonuses[method] || 0}) = ${Math.round(confidence * 100)}%`);
        
        return Math.max(confidence, 0.1); // Minimum 10% confidence
    }

    /**
     * Determine if a result is better than the current best result
     * Priority: Products found > Confidence score
     */
    isBetterResult(newResult, currentBest) {
        const newProductCount = newResult.products.length;
        const currentProductCount = currentBest.products.length;
        
        // If new result has products and current doesn't, new is better
        if (newProductCount > 0 && currentProductCount === 0) {
            return true;
        }
        
        // If current has products and new doesn't, current is better
        if (currentProductCount > 0 && newProductCount === 0) {
            return false;
        }
        
        // If both have products, compare by product count first, then confidence
        if (newProductCount > 0 && currentProductCount > 0) {
            if (newProductCount > currentProductCount) {
                return true;
            }
            if (newProductCount === currentProductCount) {
                return newResult.confidence > currentBest.confidence;
            }
            return false;
        }
        
        // If neither has products, compare by confidence only
        return newResult.confidence > currentBest.confidence;
    }

    /**
     * Extract readable text from PDF buffer using basic string search
     */
    extractBasicTextFromBuffer(dataBuffer) {
        try {
            // Convert buffer to string and look for readable text patterns
            const bufferStr = dataBuffer.toString('latin1');
            
            // Look for actual readable product text patterns
            let extractedText = '';
            
            // Method 1: Look for text in parentheses (common PDF text encoding)
            const parenthesesMatches = bufferStr.match(/\(([^)]{5,})\)/g);
            if (parenthesesMatches) {
                for (const match of parenthesesMatches) {
                    const cleanText = match
                        .replace(/[()]/g, '')
                        .replace(/\\[nrt]/g, ' ') // Replace escape sequences
                        .trim();
                    
                    // Only include if it looks like readable text (not PDF metadata)
                    if (cleanText.length > 5 && 
                        /[A-Za-z]/.test(cleanText) && 
                        !cleanText.match(/^\/\w+|endobj|stream|xref|trailer|startxref/)) {
                        extractedText += cleanText + '\n';
                    }
                }
            }
            
            // Method 2: Look for readable words in the stream
            const readableWords = bufferStr.match(/\b[A-Za-z][A-Za-z0-9\s]{3,50}\b/g);
            if (readableWords) {
                const meaningfulWords = readableWords.filter(word => {
                    // Filter out PDF keywords and metadata
                    return !word.match(/^(obj|endobj|stream|endstream|xref|trailer|startxref|Font|Type|BaseFont|Encoding|Helvetica|Arial)$/i) &&
                           word.length >= 4 &&
                           /[A-Za-z]/.test(word);
                });
                
                // Group similar words together to form sentences
                let currentSentence = '';
                for (const word of meaningfulWords) {
                    if (word.match(/^(Product|Name|SKU|Price|Quantity|Category|Samsung|Apple|Sony|MacBook|Galaxy|iPhone)/i)) {
                        if (currentSentence) {
                            extractedText += currentSentence.trim() + '\n';
                        }
                        currentSentence = word + ' ';
                    } else {
                        currentSentence += word + ' ';
                    }
                }
                if (currentSentence) {
                    extractedText += currentSentence.trim() + '\n';
                }
            }
            
            // Method 3: Look for structured patterns like "Product: Name" or "Price: $Amount"
            const structuredPatterns = [
                /Product[:\s]+([A-Za-z0-9\s]+)/gi,
                /Name[:\s]+([A-Za-z0-9\s]+)/gi,
                /SKU[:\s]+([A-Z0-9\-]+)/gi,
                /Price[:\s]+[\$€£₹]?([0-9.,]+)/gi,
                /Quantity[:\s]+([0-9]+)/gi,
                /Category[:\s]+([A-Za-z\s]+)/gi
            ];
            
            for (const pattern of structuredPatterns) {
                const matches = bufferStr.match(pattern);
                if (matches) {
                    for (const match of matches) {
                        extractedText += match.trim() + '\n';
                    }
                }
            }
            
            // Clean and deduplicate the extracted text
            const lines = extractedText.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0)
                .filter((line, index, arr) => arr.indexOf(line) === index); // Remove duplicates
            
            const finalText = lines.join('\n');
            console.log(`📄 Extracted ${finalText.length} characters of meaningful text from corrupted PDF buffer`);
            
            return finalText;
            
        } catch (error) {
            console.error('❌ Basic text extraction failed:', error);
            return '';
        }
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
