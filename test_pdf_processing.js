const pdfProcessingService = require('./backend/services/pdfProcessingService');
const path = require('path');

async function testPDFProcessing() {
    console.log('🧪 Testing Enhanced PDF Processing with Error Handling...\n');
    
    const testFiles = [
        'backend/uploads/pdfs/simple_product_list.pdf',
        'backend/uploads/pdfs/product_table.pdf'
    ];
    
    for (const filePath of testFiles) {
        console.log(`\n📄 Testing: ${filePath}`);
        console.log('='.repeat(50));
        
        try {
            const result = await pdfProcessingService.processPDF(filePath);
            
            if (result.success) {
                console.log('✅ PDF Processing Successful!');
                console.log(`📊 Found ${result.data.products.length} products`);
                console.log(`🔍 Method: ${result.data.summary.method}`);
                console.log(`💪 Confidence: ${Math.round(result.data.summary.confidence * 100)}%`);
                console.log(`⏱️ Processing Time: ${result.data.summary.processingTime}`);
                
                if (result.warning) {
                    console.log(`⚠️ Warning: ${result.warning}`);
                }
                
                // Show first product extracted
                if (result.data.products.length > 0) {
                    console.log('\n📦 First Product:');
                    const product = result.data.products[0];
                    console.log(`- Name: ${product.name}`);
                    console.log(`- SKU: ${product.sku}`);
                    console.log(`- Price: ${product.sellingPrice}`);
                    console.log(`- Stock: ${product.currentStock}`);
                }
            } else {
                console.log('❌ PDF Processing Failed!');
                console.log(`Error: ${result.error}`);
                
                if (result.diagnostics) {
                    console.log('\n🔍 Diagnostics:');
                    console.log(`- Original PDF Error: ${result.diagnostics.originalPDFError}`);
                    console.log(`- OCR Fallback Error: ${result.diagnostics.ocrFallbackError}`);
                    console.log(`- File Size: ${result.diagnostics.fileSize} bytes`);
                    console.log('\n💡 Suggestions:');
                    result.diagnostics.suggestions.forEach(suggestion => {
                        console.log(`- ${suggestion}`);
                    });
                }
            }
            
        } catch (error) {
            console.log('💥 Unexpected Error:');
            console.log(error.message);
        }
    }
    
    console.log('\n✅ Test completed!');
}

// Run the test
testPDFProcessing().catch(console.error);