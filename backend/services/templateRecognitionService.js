/**
 * Smart Template Recognition Service
 * Automatically detects common PDF formats and applies appropriate extraction strategies
 */
class TemplateRecognitionService {
    constructor() {
        // Known templates with their patterns
        this.templates = {
            amazon_invoice: {
                name: 'Amazon Invoice',
                patterns: [
                    /amazon\.com/i,
                    /tax invoice/i,
                    /order\s*#/i,
                    /billing address/i
                ],
                confidence: 0.8,
                extractionMethod: 'amazon_specific'
            },
            
            flipkart_invoice: {
                name: 'Flipkart Invoice',
                patterns: [
                    /flipkart/i,
                    /retail invoice/i,
                    /seller.*flipkart/i
                ],
                confidence: 0.8,
                extractionMethod: 'flipkart_specific'
            },

            generic_catalog: {
                name: 'Product Catalog',
                patterns: [
                    /product\s*catalog/i,
                    /price\s*list/i,
                    /catalog\s*\d{4}/i,
                    /our\s*products/i
                ],
                confidence: 0.7,
                extractionMethod: 'catalog_optimized'
            },

            wholesale_price_list: {
                name: 'Wholesale Price List',
                patterns: [
                    /wholesale\s*price/i,
                    /dealer\s*price/i,
                    /trade\s*price/i,
                    /bulk\s*price/i
                ],
                confidence: 0.75,
                extractionMethod: 'wholesale_optimized'
            },

            inventory_report: {
                name: 'Inventory Report',
                patterns: [
                    /inventory\s*report/i,
                    /stock\s*report/i,
                    /current\s*stock/i,
                    /available\s*quantity/i
                ],
                confidence: 0.8,
                extractionMethod: 'inventory_optimized'
            },

            supplier_quotation: {
                name: 'Supplier Quotation',
                patterns: [
                    /quotation/i,
                    /price\s*quote/i,
                    /valid\s*until/i,
                    /terms\s*and\s*conditions/i
                ],
                confidence: 0.75,
                extractionMethod: 'quotation_optimized'
            },

            pos_receipt: {
                name: 'POS Receipt',
                patterns: [
                    /receipt/i,
                    /thank\s*you/i,
                    /cashier/i,
                    /change\s*due/i
                ],
                confidence: 0.7,
                extractionMethod: 'receipt_optimized'
            },

            excel_export: {
                name: 'Excel/CSV Export',
                patterns: [
                    /exported\s*from/i,
                    /generated\s*on/i,
                    /microsoft\s*excel/i
                ],
                confidence: 0.6,
                extractionMethod: 'spreadsheet_optimized'
            }
        };

        // Format-specific extraction strategies
        this.extractionStrategies = {
            amazon_specific: this.extractAmazonFormat.bind(this),
            flipkart_specific: this.extractFlipkartFormat.bind(this),
            catalog_optimized: this.extractCatalogOptimized.bind(this),
            wholesale_optimized: this.extractWholesaleOptimized.bind(this),
            inventory_optimized: this.extractInventoryOptimized.bind(this),
            quotation_optimized: this.extractQuotationOptimized.bind(this),
            receipt_optimized: this.extractReceiptOptimized.bind(this),
            spreadsheet_optimized: this.extractSpreadsheetOptimized.bind(this)
        };
    }

    /**
     * Detect template type from PDF text
     */
    detectTemplate(text) {
        const results = [];

        for (const [templateKey, template] of Object.entries(this.templates)) {
            let score = 0;
            let matchedPatterns = 0;

            // Check how many patterns match
            for (const pattern of template.patterns) {
                if (pattern.test(text)) {
                    matchedPatterns++;
                }
            }

            // Calculate confidence score
            score = (matchedPatterns / template.patterns.length) * template.confidence;

            if (score > 0.3) { // Minimum threshold
                results.push({
                    templateKey,
                    name: template.name,
                    confidence: score,
                    extractionMethod: template.extractionMethod,
                    matchedPatterns,
                    totalPatterns: template.patterns.length
                });
            }
        }

        // Sort by confidence
        results.sort((a, b) => b.confidence - a.confidence);

        return {
            bestMatch: results[0] || null,
            allMatches: results,
            hasTemplate: results.length > 0
        };
    }

    /**
     * Apply template-specific extraction
     */
    async applyTemplate(text, templateResult, options = {}) {
        if (!templateResult.hasTemplate) {
            return { 
                success: false, 
                products: [],
                method: 'no_template_detected'
            };
        }

        const bestTemplate = templateResult.bestMatch;
        const extractionMethod = this.extractionStrategies[bestTemplate.extractionMethod];

        if (!extractionMethod) {
            return { 
                success: false, 
                products: [],
                method: 'extraction_method_not_found'
            };
        }

        try {
            const result = await extractionMethod(text, options);
            return {
                success: true,
                products: result.products || [],
                confidence: result.confidence * bestTemplate.confidence,
                method: bestTemplate.extractionMethod,
                templateName: bestTemplate.name,
                templateConfidence: bestTemplate.confidence
            };
        } catch (error) {
            console.error(`Template extraction failed for ${bestTemplate.name}:`, error);
            return {
                success: false,
                products: [],
                method: 'template_extraction_failed',
                error: error.message
            };
        }
    }

    /**
     * Amazon Invoice specific extraction
     */
    async extractAmazonFormat(text, options) {
        
        const products = [];
        const lines = text.split('\n');
        let inItemSection = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Look for item section start
            if (line.match(/item.*quantity.*price/i) || line.includes('Order Details')) {
                inItemSection = true;
                continue;
            }
            
            // Look for item section end
            if (line.match(/subtotal|shipping|tax|total/i) && inItemSection) {
                inItemSection = false;
                continue;
            }
            
            if (inItemSection) {
                const product = this.parseAmazonItem(line, lines, i);
                if (product) {
                    products.push(product);
                }
            }
        }

        return {
            products,
            confidence: products.length > 0 ? 0.85 : 0.1
        };
    }

    parseAmazonItem(line, allLines, index) {
        // Amazon items often span multiple lines
        const nameMatch = line.match(/^(.+?)(?:\s+\d+\s+|\s+₹|\s+\$)/);
        if (nameMatch) {
            const name = nameMatch[1].trim();
            
            // Look for price in same line or next few lines
            let price = null;
            const priceMatch = line.match(/[₹$]?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
            if (priceMatch) {
                price = parseFloat(priceMatch[1].replace(/,/g, ''));
            }
            
            // Look for quantity
            const qtyMatch = line.match(/(?:qty|quantity)[:\s]*(\d+)/i) || line.match(/\b(\d+)\s*x\s/);
            const quantity = qtyMatch ? parseInt(qtyMatch[1]) : 1;
            
            if (name && name.length > 3) {
                return {
                    name,
                    sellingPrice: price || 0,
                    currentStock: quantity,
                    category: 'Electronics', // Default for Amazon
                    sku: this.generateSKU(name)
                };
            }
        }
        return null;
    }

    /**
     * Flipkart Invoice specific extraction
     */
    async extractFlipkartFormat(text, options) {
        
        const products = [];
        const itemBlocks = text.split(/(?=\d+\.\s)/); // Split by item numbers
        
        for (const block of itemBlocks) {
            if (block.trim().length < 20) continue;
            
            const product = this.parseFlipkartItem(block);
            if (product) {
                products.push(product);
            }
        }

        return {
            products,
            confidence: products.length > 0 ? 0.8 : 0.1
        };
    }

    parseFlipkartItem(block) {
        // Extract product name (usually first line after number)
        const lines = block.split('\n').filter(l => l.trim());
        if (lines.length < 2) return null;
        
        let name = lines[1]?.trim();
        if (!name || name.length < 3) return null;
        
        // Extract price
        const priceMatch = block.match(/[₹$](\d+(?:,\d{3})*(?:\.\d{2})?)/);
        const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : 0;
        
        // Extract quantity
        const qtyMatch = block.match(/qty[:\s]*(\d+)/i);
        const quantity = qtyMatch ? parseInt(qtyMatch[1]) : 1;
        
        return {
            name,
            sellingPrice: price,
            currentStock: quantity,
            category: 'General',
            sku: this.generateSKU(name)
        };
    }

    /**
     * Optimized catalog extraction
     */
    async extractCatalogOptimized(text, options) {
        
        const products = [];
        const sections = this.smartSectionSplit(text);
        
        for (const section of sections) {
            const sectionProducts = this.extractCatalogProducts(section);
            products.push(...sectionProducts);
        }

        return {
            products,
            confidence: products.length > 0 ? 0.75 : 0.2
        };
    }

    smartSectionSplit(text) {
        // More intelligent section splitting for catalogs
        return text.split(/(?:\n\s*){2,}|\n[-=_]{4,}\n|\n\*{4,}\n/)
                  .filter(section => section.trim().length > 30);
    }

    extractCatalogProducts(section) {
        const products = [];
        const lines = section.split('\n').map(l => l.trim()).filter(l => l);
        
        let currentProduct = null;
        
        for (const line of lines) {
            // Product name detection (enhanced)
            if (this.looksLikeProductName(line)) {
                if (currentProduct) {
                    products.push(currentProduct);
                }
                currentProduct = { name: line };
            } else if (currentProduct) {
                this.enhanceProductInfo(currentProduct, line);
            }
        }
        
        if (currentProduct) {
            products.push(currentProduct);
        }
        
        return products.filter(p => this.isValidCatalogProduct(p));
    }

    looksLikeProductName(line) {
        return line.length >= 5 && 
               line.length <= 120 && 
               !/^\d+\.?\d*$/.test(line) &&
               !/^[^a-zA-Z]*$/.test(line) &&
               !line.toLowerCase().match(/^(page|total|subtotal|tax|shipping)/);
    }

    enhanceProductInfo(product, line) {
        // Enhanced info extraction with better patterns
        
        // Price extraction (multiple currencies)
        const pricePattern = /(?:price|cost|rate)[:\s]*([₹$£€¥]?\s*\d+(?:[,.]\d{2,3})*(?:\.\d{2})?)/i;
        const priceMatch = line.match(pricePattern) || line.match(/([₹$£€¥]\s*\d+(?:[,.]\d{3})*(?:\.\d{2})?)/);
        if (priceMatch && !product.price) {
            const priceStr = priceMatch[1].replace(/[₹$£€¥,\s]/g, '');
            product.price = parseFloat(priceStr);
        }
        
        // SKU extraction (enhanced)
        const skuPattern = /(?:sku|code|item\s*#|part\s*(?:no|number))[:\s]*([A-Z0-9\-_]{3,20})/i;
        const skuMatch = line.match(skuPattern);
        if (skuMatch && !product.sku) {
            product.sku = skuMatch[1];
        }
        
        // Category extraction
        const categoryPattern = /(?:category|type|class)[:\s]*([a-zA-Z\s]+)/i;
        const categoryMatch = line.match(categoryPattern);
        if (categoryMatch && !product.category) {
            product.category = categoryMatch[1].trim();
        }
        
        // Brand extraction
        const brandPattern = /(?:brand|make|manufacturer)[:\s]*([a-zA-Z\s]+)/i;
        const brandMatch = line.match(brandPattern);
        if (brandMatch && !product.brand) {
            product.brand = brandMatch[1].trim();
        }
        
        // Stock extraction
        const stockPattern = /(?:stock|qty|quantity|available)[:\s]*(\d+)/i;
        const stockMatch = line.match(stockPattern);
        if (stockMatch && !product.stock) {
            product.stock = parseInt(stockMatch[1]);
        }
    }

    isValidCatalogProduct(product) {
        return product && 
               product.name && 
               product.name.length >= 3 && 
               (product.price || product.sku);
    }

    /**
     * Wholesale price list optimized extraction
     */
    async extractWholesaleOptimized(text, options) {
        
        // Wholesale lists often have better structure
        return await this.extractTableWithFallback(text, {
            priceColumn: ['wholesale', 'dealer', 'trade'],
            quantityColumn: ['min qty', 'minimum', 'bulk qty']
        });
    }

    /**
     * Enhanced table extraction with fallback
     */
    async extractTableWithFallback(text, columnHints = {}) {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        const products = [];
        
        // Try to find table headers
        let headerIndex = -1;
        let headers = [];
        
        for (let i = 0; i < Math.min(15, lines.length); i++) {
            const line = lines[i].toLowerCase();
            if (this.containsTableHeaders(line, columnHints)) {
                headerIndex = i;
                headers = this.parseTableHeaders(lines[i], columnHints);
                break;
            }
        }
        
        if (headerIndex >= 0) {
            // Process table rows
            for (let i = headerIndex + 1; i < lines.length; i++) {
                const product = this.parseEnhancedTableRow(lines[i], headers);
                if (product && this.isValidTableProduct(product)) {
                    products.push(product);
                }
            }
        }
        
        return {
            products,
            confidence: products.length > 0 ? 0.85 : 0.3
        };
    }

    containsTableHeaders(line, hints = {}) {
        const standardHeaders = ['name', 'item', 'product', 'sku', 'code', 'price'];
        const hintHeaders = Object.values(hints).flat();
        const allHeaders = [...standardHeaders, ...hintHeaders];
        
        const matches = allHeaders.filter(header => line.includes(header));
        return matches.length >= 2;
    }

    parseTableHeaders(line, hints = {}) {
        // More intelligent header parsing
        const parts = line.split(/[\t|]{2,}|,(?=\s*[A-Za-z])/).map(h => h.trim().toLowerCase());
        
        return parts.map(header => {
            // Standard mappings
            if (header.includes('name') || header.includes('item') || header.includes('product')) return 'name';
            if (header.includes('sku') || header.includes('code') || header.includes('part')) return 'sku';
            if (header.includes('category') || header.includes('type') || header.includes('class')) return 'category';
            if (header.includes('brand') || header.includes('make') || header.includes('manufacturer')) return 'brand';
            
            // Price variations
            if (header.includes('price') || header.includes('cost') || header.includes('rate') || header.includes('amount')) return 'price';
            if (hints.priceColumn && hints.priceColumn.some(hint => header.includes(hint))) return 'price';
            
            // Quantity variations
            if (header.includes('qty') || header.includes('quantity') || header.includes('stock') || header.includes('available')) return 'stock';
            if (hints.quantityColumn && hints.quantityColumn.some(hint => header.includes(hint))) return 'stock';
            
            return header;
        });
    }

    parseEnhancedTableRow(line, headers) {
        // Handle various delimiters
        let values;
        
        if (line.includes('\t')) {
            values = line.split('\t');
        } else if (line.match(/\s{3,}/)) {
            values = line.split(/\s{3,}/);
        } else if (line.includes('|')) {
            values = line.split('|');
        } else if (line.includes(',')) {
            values = line.split(',');
        } else {
            // Fallback: split by common patterns
            values = line.split(/\s{2,}/);
        }
        
        values = values.map(v => v.trim()).filter(v => v);
        
        const product = {};
        for (let i = 0; i < Math.min(headers.length, values.length); i++) {
            if (headers[i] && values[i]) {
                product[headers[i]] = values[i];
            }
        }
        
        return Object.keys(product).length > 0 ? product : null;
    }

    isValidTableProduct(product) {
        return product && 
               (product.name || product.item) && 
               (product.price || product.sku);
    }

    // Additional extraction methods for other templates...
    async extractInventoryOptimized(text, options) {
        return await this.extractTableWithFallback(text, {
            quantityColumn: ['current stock', 'available', 'on hand', 'inventory'],
            priceColumn: ['unit cost', 'value', 'cost price']
        });
    }

    async extractQuotationOptimized(text, options) {
        return await this.extractTableWithFallback(text, {
            priceColumn: ['unit price', 'rate', 'quoted price'],
            quantityColumn: ['quantity', 'qty requested']
        });
    }

    async extractReceiptOptimized(text, options) {
        
        const products = [];
        const lines = text.split('\n');
        let inItemSection = false;
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            if (this.isReceiptItemStart(trimmed)) {
                inItemSection = true;
                continue;
            }
            
            if (this.isReceiptItemEnd(trimmed)) {
                inItemSection = false;
                continue;
            }
            
            if (inItemSection) {
                const product = this.parseReceiptItem(trimmed);
                if (product) {
                    products.push(product);
                }
            }
        }

        return {
            products,
            confidence: products.length > 0 ? 0.7 : 0.1
        };
    }

    isReceiptItemStart(line) {
        return line.match(/item|product|description/i) && line.match(/price|amount/i);
    }

    isReceiptItemEnd(line) {
        return line.match(/subtotal|total|tax|change|payment/i);
    }

    parseReceiptItem(line) {
        // Receipt format: "Item Name    Qty x Price    Amount"
        const parts = line.split(/\s{2,}/).filter(p => p.trim());
        
        if (parts.length >= 2) {
            const name = parts[0];
            const priceMatch = parts[parts.length - 1].match(/(\d+\.?\d*)/);
            const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
            
            const qtyMatch = line.match(/(\d+)\s*x/i);
            const quantity = qtyMatch ? parseInt(qtyMatch[1]) : 1;
            
            return {
                name,
                sellingPrice: price / quantity, // Unit price
                currentStock: quantity,
                category: 'Retail',
                sku: this.generateSKU(name)
            };
        }
        
        return null;
    }

    async extractSpreadsheetOptimized(text, options) {
        
        // Spreadsheet exports usually have clean tabular data
        return await this.extractTableWithFallback(text, {
            priceColumn: ['price', 'unit price', 'cost'],
            quantityColumn: ['quantity', 'stock', 'inventory level']
        });
    }

    // Utility methods
    generateSKU(name) {
        if (!name) return 'SKU' + Date.now();
        
        const cleaned = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const timestamp = Date.now().toString().slice(-4);
        return (cleaned.substring(0, 6) + timestamp).padEnd(10, '0');
    }
}

module.exports = new TemplateRecognitionService();
