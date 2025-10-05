import { useState, useEffect, useRef } from 'react';
import { InventoryLayout } from '@/layouts';
import { Printer, Settings, Download, Package, Tag, Edit3, Copy, Grid3X3, Loader2, AlertCircle, Sparkles, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { apiService, type LabelTemplate } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import type { Product } from '@/types/product';
import JsBarcode from 'jsbarcode';

export default function LabelPrinting() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('template1');
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [customText, setCustomText] = useState('');
  const [labelQuantity, setLabelQuantity] = useState(1);
  const [previewMode, setPreviewMode] = useState<'product' | 'custom'>('product');

  // Backend data state
  const [templates, setTemplates] = useState<LabelTemplate[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const { toast } = useToast();
  
  const showToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    toast({
      title,
      description: message,
      type,
    });
  };

  // Test function to generate a simple custom label
  const testLabelGeneration = async () => {
    try {
      setIsGenerating(true);
      console.log('Testing label generation...');
      
      const pdfBlob = await apiService.generateLabelPDF({
        templateId: 'template3', // Price Tag Only template
        customText: 'Test Label - Hello World!',
        quantity: 1
      });

      console.log('Test PDF generated, size:', pdfBlob.size);
      
      // Download the test PDF
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-label-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Success', 'Test label generated successfully!', 'success');
    } catch (error) {
      console.error('Test label generation failed:', error);
      showToast('Error', `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Load templates and products on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Sample professional products for fallback/demo
  const sampleProducts: Product[] = [
    {
      _id: 'sample-1',
      name: 'Apple iPhone 15 Pro Max',
      sku: 'APL-IPH15PM-256',
      barcode: '1234567890128',
      category: 'Electronics',
      brand: 'Apple',
      sellingPrice: 134900,
      costPrice: 120000,
      wholesalePrice: 125000,
      currentStock: 25,
      minStockLevel: 5,
      stock: 25,
      isActive: true,
      supplier: {
        name: 'Tech Distributors Ltd',
        contact: '+91 98765-43210',
        email: 'sales@techdist.com'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: '256GB Storage, Space Black Color'
    },
    {
      _id: 'sample-2',
      name: 'Samsung Galaxy Buds Pro',
      sku: 'SAM-GBPRO-WHT',
      barcode: '9876543210987',
      category: 'Audio',
      brand: 'Samsung',
      sellingPrice: 19999,
      costPrice: 16000,
      wholesalePrice: 17500,
      currentStock: 8,
      minStockLevel: 10,
      stock: 8,
      isActive: true,
      supplier: {
        name: 'Audio Solutions Inc',
        contact: '+91 87654-32109'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: 'Wireless Earbuds with ANC'
    },
    {
      _id: 'sample-3',
      name: 'Sony WH-1000XM5 Headphones',
      sku: 'SNY-WH1000X5-BLK',
      barcode: '5432167890123',
      category: 'Audio',
      brand: 'Sony',
      sellingPrice: 29990,
      costPrice: 25000,
      wholesalePrice: 26500,
      currentStock: 15,
      minStockLevel: 5,
      stock: 15,
      isActive: true,
      supplier: {
        name: 'Premium Electronics',
        contact: '+91 76543-21098',
        email: 'orders@premiumelec.com'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: 'Premium Noise Cancelling Headphones'
    }
  ];

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load templates and products in parallel
      const [templatesResponse, productsResponse] = await Promise.all([
        apiService.getLabelTemplates(),
        apiService.getProducts({ limit: 50 }) // Limit for label printing selection
      ]);

      if (templatesResponse.success && templatesResponse.data) {
        setTemplates(templatesResponse.data.templates);
      } else {
        // Fallback templates for demo
        setTemplates([
          {
            id: 'template1',
            name: 'Professional Product Label',
            size: '2" x 1"',
            fields: ['name', 'price', 'sku', 'barcode'],
            layout: 'single',
            isDefault: true,
            settings: {
              fontSize: 10,
              fontFamily: 'Arial',
              backgroundColor: '#ffffff',
              textColor: '#000000',
              showBorder: true
            }
          },
          {
            id: 'template2',
            name: 'Premium Price Tag',
            size: '3" x 2"',
            fields: ['name', 'price', 'category', 'brand', 'barcode'],
            layout: 'single',
            isDefault: true,
            settings: {
              fontSize: 12,
              fontFamily: 'Arial',
              backgroundColor: '#ffffff',
              textColor: '#000000',
              showBorder: true
            }
          },
          {
            id: 'template3',
            name: 'Inventory Label',
            size: '2" x 1"',
            fields: ['name', 'sku', 'stock', 'barcode'],
            layout: 'single',
            isDefault: true,
            settings: {
              fontSize: 9,
              fontFamily: 'Arial',
              backgroundColor: '#ffffff',
              textColor: '#000000',
              showBorder: true
            }
          }
        ]);
      }

      if (productsResponse.success && productsResponse.data && productsResponse.data.products?.length > 0) {
        setProducts(productsResponse.data.products);
      } else {
        // Use sample products for demo when no real products are available
        setProducts(sampleProducts);
        showToast('Demo Mode', 'Using sample products for demonstration', 'info');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      // Use sample data as fallback
      setProducts(sampleProducts);
      setTemplates([
        {
          id: 'template1',
          name: 'Professional Product Label',
          size: '2" x 1"',
          fields: ['name', 'price', 'sku', 'barcode'],
          layout: 'single',
          isDefault: true
        }
      ]);
      showToast('Error loading data', 'Using demo data instead', 'error');
    } finally {
      setLoading(false);
    }
  };

  const currentTemplate = templates.find(t => t.id === selectedTemplate);

  const addProduct = (product: Product) => {
    if (!selectedProducts.find(p => p._id === product._id)) {
      setSelectedProducts(prev => [...prev, product]);
    }
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p._id !== productId));
  };

  const handlePrint = async () => {
    if (previewMode === 'product' && selectedProducts.length === 0) {
      showToast('Error', 'Please select products to print labels', 'error');
      return;
    }
    if (previewMode === 'custom' && !customText) {
      showToast('Error', 'Please enter custom text for labels', 'error');
      return;
    }
    
    try {
      setIsGenerating(true);
      console.log('Generating PDF with:', {
        templateId: selectedTemplate,
        products: previewMode === 'product' ? selectedProducts.map(p => p._id) : undefined,
        customText: previewMode === 'custom' ? customText : undefined,
        quantity: labelQuantity
      });
      
      // Generate PDF for printing
      const pdfBlob = await apiService.generateLabelPDF({
        templateId: selectedTemplate,
        products: previewMode === 'product' ? selectedProducts.map(p => p._id) : undefined,
        customText: previewMode === 'custom' ? customText : undefined,
        quantity: labelQuantity
      });

      console.log('PDF generated successfully, blob size:', pdfBlob.size);

      // Create and open PDF in new window for printing
      const url = URL.createObjectURL(pdfBlob);
      
      try {
        // Try to open in new window first
        const printWindow = window.open('', '_blank');
        
        if (printWindow) {
          // Write a simple HTML page that loads and prints the PDF
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Print Labels</title>
              <style>
                body { margin: 0; padding: 0; }
                iframe { width: 100%; height: 100vh; border: none; }
                .print-info { 
                  position: fixed; 
                  top: 10px; 
                  left: 10px; 
                  background: #f0f0f0; 
                  padding: 10px; 
                  border-radius: 5px;
                  z-index: 1000;
                }
              </style>
            </head>
            <body>
              <div class="print-info">
                <strong>Labels ready to print!</strong><br>
                Use Ctrl+P or Cmd+P to print, or use the browser's print button.
              </div>
              <iframe src="${url}" onload="setTimeout(() => window.print(), 1500)"></iframe>
            </body>
            </html>
          `);
          printWindow.document.close();
          
          showToast('Success', 'Print window opened - print dialog should appear shortly', 'success');
          
          // Clean up URL after some time
          setTimeout(() => URL.revokeObjectURL(url), 30000);
        } else {
          throw new Error('Popup blocked');
        }
      } catch (error) {
        // Fallback: download the PDF if popup was blocked
        console.log('Popup blocked, falling back to download');
        const a = document.createElement('a');
        a.href = url;
        a.download = `labels-print-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Info', 'PDF downloaded for printing (popup was blocked)', 'info');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to print labels';
      showToast('Error', errorMessage, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintPreview = async () => {
    if (previewMode === 'product' && selectedProducts.length === 0) {
      showToast('Error', 'Please select products to preview labels', 'error');
      return;
    }
    if (previewMode === 'custom' && !customText) {
      showToast('Error', 'Please enter custom text for labels', 'error');
      return;
    }

    try {
      setIsGenerating(true);
      console.log('Generating print preview...');
      
      const pdfBlob = await apiService.generateLabelPDF({
        templateId: selectedTemplate,
        products: previewMode === 'product' ? selectedProducts.map(p => p._id) : undefined,
        customText: previewMode === 'custom' ? customText : undefined,
        quantity: labelQuantity
      });

      // Open PDF in new tab for preview and printing
      const url = URL.createObjectURL(pdfBlob);
      const newTab = window.open(url, '_blank');
      
      if (newTab) {
        showToast('Success', 'Print preview opened in new tab', 'success');
        // Clean up URL after some time
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      } else {
        showToast('Error', 'Popup blocked. Please allow popups and try again.', 'error');
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to open print preview';
      showToast('Error', errorMessage, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'png') => {
    if (previewMode === 'product' && selectedProducts.length === 0) {
      showToast('Error', 'Please select products to export labels', 'error');
      return;
    }
    if (previewMode === 'custom' && !customText) {
      showToast('Error', 'Please enter custom text for labels', 'error');
      return;
    }

    try {
      setIsGenerating(true);
      
      if (format === 'pdf') {
        console.log('Exporting PDF with:', {
          templateId: selectedTemplate,
          products: previewMode === 'product' ? selectedProducts.map(p => p._id) : undefined,
          customText: previewMode === 'custom' ? customText : undefined,
          quantity: labelQuantity
        });
        
        const pdfBlob = await apiService.generateLabelPDF({
          templateId: selectedTemplate,
          products: previewMode === 'product' ? selectedProducts.map(p => p._id) : undefined,
          customText: previewMode === 'custom' ? customText : undefined,
          quantity: labelQuantity
        });

        console.log('PDF exported successfully, blob size:', pdfBlob.size);

        // Download PDF
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `labels-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('Success', 'PDF exported successfully', 'success');
      } else {
        showToast('Info', 'PNG export feature coming soon', 'info');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to export labels';
      showToast('Error', errorMessage, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderLabelPreview = (product?: Product, customContent?: string) => {
    if (!currentTemplate) return null;

    return (
      <div className="group relative max-w-sm mx-auto">
        {/* Professional vertical label card with shadow and hover effects */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-5 transition-all duration-200 hover:shadow-lg hover:border-blue-300 min-h-40">
          {previewMode === 'product' && product ? (
            <ProfessionalProductLabel product={product} template={currentTemplate} />
          ) : previewMode === 'custom' && customContent ? (
            <ProfessionalCustomLabel content={customContent} template={currentTemplate} />
          ) : (
            <EmptyLabelPreview />
          )}
        </div>
        
        {/* Professional label size indicator */}
        <div className="mt-3 text-center">
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
            {currentTemplate?.size}
          </Badge>
        </div>
      </div>
    );
  };

  // Professional Product Label Component
  const ProfessionalProductLabel = ({ product, template }: { product: Product; template: LabelTemplate }) => {
    const barcodeRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
      // Generate real barcode for the product
      if (barcodeRef.current && template.fields.includes('barcode') && (product.barcode || product.sku)) {
        const barcodeValue = product.barcode || product.sku;
        try {
          // Clear previous content
          barcodeRef.current.innerHTML = '';
          
          // Create canvas for barcode
          const canvas = document.createElement('canvas');
          JsBarcode(canvas, barcodeValue, {
            format: "CODE128",
            width: 1.5,
            height: 25,
            displayValue: false,
            margin: 0,
            background: "#ffffff",
            lineColor: "#000000",
          });
          
          // Append to ref
          barcodeRef.current.appendChild(canvas);
        } catch (error) {
          console.error('Barcode generation failed:', error);
          barcodeRef.current.innerHTML = `
            <div class="h-6 bg-gray-300 rounded flex items-center justify-center">
              <span class="text-xs text-gray-600">Invalid Code</span>
            </div>
          `;
        }
      }
    }, [product, template]);

    return (
      <div className="space-y-2">
        {/* Product Name - Always prominent */}
        {template.fields.includes('name') && (
          <div className="border-b border-gray-100 pb-1">
            <h3 className="font-bold text-sm text-gray-900 leading-tight truncate">
              {product.name}
            </h3>
          </div>
        )}

        <div className="space-y-1.5">
          {/* Price - Highlighted */}
          {template.fields.includes('price') && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Price:</span>
              <span className="font-bold text-green-600 text-lg">
                ₹{product.sellingPrice.toLocaleString()}
              </span>
            </div>
          )}

          {/* SKU */}
          {template.fields.includes('sku') && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">SKU:</span>
              <span className="font-mono text-xs text-gray-700 bg-gray-50 px-1 rounded">
                {product.sku}
              </span>
            </div>
          )}

          {/* Category */}
          {template.fields.includes('category') && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Category:</span>
              <Badge className="text-xs py-0 px-2 bg-blue-100 text-blue-800 border-blue-200">
                {product.category}
              </Badge>
            </div>
          )}

          {/* Brand */}
          {template.fields.includes('brand') && product.brand && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Brand:</span>
              <span className="text-xs font-medium text-gray-700">{product.brand}</span>
            </div>
          )}

          {/* Stock Info */}
          {template.fields.includes('stock') && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Stock:</span>
              <Badge 
                className={`text-xs py-0 px-2 ${
                  product.currentStock <= 10 
                    ? 'bg-red-100 text-red-800 border-red-200' 
                    : 'bg-green-100 text-green-800 border-green-200'
                }`}
              >
                {product.currentStock} units
              </Badge>
            </div>
          )}

          {/* Barcode */}
          {template.fields.includes('barcode') && (product.barcode || product.sku) && (
            <div className="pt-2 border-t border-gray-100">
              <div className="text-center">
                <div ref={barcodeRef} className="flex justify-center items-center h-8 mb-1" />
                <p className="text-xs font-mono text-gray-600 truncate">
                  {(product.barcode || product.sku)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Professional Custom Label Component
  const ProfessionalCustomLabel = ({ content, template }: { content: string; template: LabelTemplate }) => {
    return (
      <div className="flex flex-col items-center justify-center space-y-2 h-full">
        <div className="text-center">
          <p className="font-semibold text-sm text-gray-900 break-words">
            {content}
          </p>
        </div>
        {template.fields.includes('barcode') && (
          <div className="pt-2 border-t border-gray-100 w-full">
            <div className="h-6 bg-gray-900 mx-auto max-w-24 flex items-center justify-center rounded">
              <span className="font-mono text-xs tracking-wider text-white">||||||||</span>
            </div>
            <p className="text-xs font-mono mt-1 text-center text-gray-600">
              {content.replace(/\s+/g, '').slice(0, 12).toUpperCase()}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Empty Label Preview
  const EmptyLabelPreview = () => (
    <div className="flex flex-col items-center justify-center h-full text-gray-400">
      <Tag className="h-8 w-8 mb-2 opacity-50" />
      <p className="text-xs text-center">
        {previewMode === 'product' ? 'Select products to preview' : 'Enter custom text to preview'}
      </p>
    </div>
  );

  return (
    <InventoryLayout activeSection="Label Printing">
      <div className="p-8 bg-background">
          {/* Enhanced Professional Header */}
          <div className="bg-gradient-to-r from-card to-accent/50 rounded-xl shadow-sm border border-border p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                  <Printer className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Professional Label Printing
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    Create professional product labels with barcodes and custom formatting
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Real-time Preview
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Multiple Templates
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Barcode Generation
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleExport('pdf')}
                    disabled={isGenerating}
                    className="bg-white hover:bg-gray-50 border-gray-300"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Export PDF
                  </Button>
                  <Button 
                    onClick={handlePrint}
                    disabled={isGenerating}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Printer className="h-4 w-4 mr-2" />
                    )}
                    Print Labels
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => handlePrintPreview()}
                    disabled={isGenerating}
                    size="sm"
                    className="bg-white hover:bg-gray-50 border-gray-300"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Print Preview
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={testLabelGeneration}
                    disabled={isGenerating}
                    size="sm"
                    className="bg-white hover:bg-gray-50 border-gray-300"
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    Test PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Loading templates and products...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <h3 className="font-medium text-red-900">Error Loading Data</h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={loadInitialData}
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Main Content */}
          {!loading && !error && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Settings */}
              <div className="space-y-6">
              {/* Template Selection */}
              <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
                  <Settings className="h-5 w-5 text-primary" />
                  Label Templates
                </h3>
                
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`group relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedTemplate === template.id
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/50 bg-card'
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      {/* Selection indicator */}
                      {selectedTemplate === template.id && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                        </div>
                      )}

                      <div className="space-y-3">
                        {/* Template header */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {template.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {template.isDefault ? 'Default Template' : 'Custom Template'}
                            </p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className="bg-white border-blue-200 text-blue-700 font-medium"
                          >
                            {template.size}
                          </Badge>
                        </div>

                        {/* Template fields */}
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1">
                            {template.fields.map((field) => (
                              <Badge 
                                key={field} 
                                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 transition-colors"
                              >
                                {field}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Template layout info */}
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            {template.layout === 'grid' ? (
                              <Grid3X3 className="h-3 w-3" />
                            ) : (
                              <Tag className="h-3 w-3" />
                            )}
                            <span>{template.layout === 'grid' ? 'Grid Layout' : 'Single Layout'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>Professional Style</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Create custom template button */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer group">
                    <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
                      <Sparkles className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-sm font-medium">Create Custom Template</p>
                      <p className="text-xs mt-1">Design your own label layout</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Print Settings */}
              <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Print Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="mode">Label Mode</Label>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant={previewMode === 'product' ? 'default' : 'outline'}
                        onClick={() => setPreviewMode('product')}
                        className="flex-1"
                      >
                        <Package className="h-4 w-4 mr-1" />
                        Product
                      </Button>
                      <Button
                        size="sm"
                        variant={previewMode === 'custom' ? 'default' : 'outline'}
                        onClick={() => setPreviewMode('custom')}
                        className="flex-1"
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        Custom
                      </Button>
                    </div>
                  </div>

                  {previewMode === 'custom' && (
                    <div>
                      <Label htmlFor="customText">Custom Text</Label>
                      <Textarea
                        id="customText"
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        placeholder="Enter custom text for labels"
                        rows={3}
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="quantity">Quantity per Item</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={labelQuantity}
                      onChange={(e) => setLabelQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      max="100"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column - Professional Product Selection */}
            {previewMode === 'product' && (
              <div className="bg-card rounded-xl shadow-sm border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Select Products</h3>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    {products.length} Available
                  </Badge>
                </div>
                
                {/* Product List with Enhanced Information */}
                <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                  {products.map((product) => (
                    <div
                      key={product._id}
                      className={`group relative p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                        selectedProducts.some(p => p._id === product._id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-blue-300'
                      }`}
                    >
                      {/* Selection indicator */}
                      {selectedProducts.some(p => p._id === product._id) && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}

                      <div className="space-y-3">
                        {/* Product Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-1">
                            <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                              {product.name}
                            </h4>
                            <p className="text-xs text-gray-500 line-clamp-1">
                              {product.description || 'No description available'}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => selectedProducts.some(p => p._id === product._id) 
                              ? removeProduct(product._id) 
                              : addProduct(product)
                            }
                            className={selectedProducts.some(p => p._id === product._id) 
                              ? 'bg-red-500 hover:bg-red-600 text-white'
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                            }
                          >
                            {selectedProducts.some(p => p._id === product._id) ? 'Remove' : 'Add'}
                          </Button>
                        </div>

                        {/* Product Details Grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {/* Price Information */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Price:</span>
                              <span className="font-bold text-green-600">
                                ₹{product.sellingPrice.toLocaleString()}
                              </span>
                            </div>
                            {product.wholesalePrice && (
                              <div className="flex items-center justify-between">
                                <span className="text-gray-500">Wholesale:</span>
                                <span className="font-medium text-blue-600">
                                  ₹{product.wholesalePrice.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Stock:</span>
                              <Badge 
                                className={`text-xs ${
                                  product.currentStock <= product.minStockLevel 
                                    ? 'bg-red-100 text-red-800 border-red-200' 
                                    : 'bg-green-100 text-green-800 border-green-200'
                                }`}
                              >
                                {product.currentStock} units
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">SKU:</span>
                              <code className="text-xs bg-gray-100 px-1 rounded font-mono">
                                {product.sku}
                              </code>
                            </div>
                          </div>
                        </div>

                        {/* Category and Brand */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <Badge className="text-xs bg-purple-100 text-purple-800 border-purple-200">
                              {product.category}
                            </Badge>
                            {product.brand && (
                              <Badge className="text-xs bg-gray-100 text-gray-700 border-gray-200">
                                {product.brand}
                              </Badge>
                            )}
                          </div>
                          {product.barcode && (
                            <div className="text-xs text-gray-500 font-mono">
                              {product.barcode}
                            </div>
                          )}
                        </div>

                        {/* Supplier Information */}
                        {typeof product.supplier === 'object' && product.supplier.name && (
                          <div className="text-xs text-gray-500 pt-1 border-t border-gray-100">
                            <span className="font-medium">Supplier:</span> {product.supplier.name}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Enhanced Selected Products Summary */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">Selected for Printing</h4>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                      {selectedProducts.length} Products
                    </Badge>
                  </div>
                  
                  {selectedProducts.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedProducts.map((product) => (
                        <div
                          key={product._id}
                          className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-600">
                              ₹{product.sellingPrice.toLocaleString()} • {product.sku}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-200 text-blue-800 border-blue-300">
                              {labelQuantity}x labels
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeProduct(product._id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                      <Package className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                      <p className="font-medium text-gray-700">No Products Selected</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Choose products from the list above to create labels
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Right Column - Enhanced Preview */}
            <div className="bg-card rounded-xl shadow-sm border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Live Preview</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentTemplate?.name} • {currentTemplate?.size}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-primary border-primary/30 hover:bg-primary/10">
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button size="sm" variant="outline" className="text-gray-600">
                    <Copy className="h-4 w-4 mr-1" />
                    Duplicate
                  </Button>
                </div>
              </div>
              
              {/* Professional Preview Container */}
              <div className="space-y-6">
                {/* Template Info Bar */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Tag className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">Professional Label</p>
                        <p className="text-xs text-blue-700">
                          {previewMode === 'product' ? 'Product Information' : 'Custom Content'}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                      {previewMode === 'product' 
                        ? `${selectedProducts.length} products × ${labelQuantity}`
                        : `${labelQuantity} labels`
                      }
                    </Badge>
                  </div>
                </div>

                {/* Vertical List Preview */}
                <div className="space-y-4">
                  {previewMode === 'product' ? (
                    selectedProducts.length > 0 ? (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {selectedProducts.slice(0, 6).map((product) => (
                          <div key={product._id} className="space-y-3">
                            {Array.from({ length: Math.min(labelQuantity, 3) }, (_, labelIndex) => (
                              <div key={labelIndex} className="transform transition-all duration-200 hover:scale-[1.02]">
                                {renderLabelPreview(product)}
                              </div>
                            ))}
                            {labelQuantity > 3 && (
                              <div className="text-center py-2">
                                <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
                                  +{labelQuantity - 3} more labels for this product
                                </Badge>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {/* Show more indicator */}
                        {selectedProducts.length > 6 && (
                          <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                            <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-600 font-medium">
                              +{selectedProducts.length - 6} more products
                            </p>
                            <p className="text-xs text-gray-500">
                              {(selectedProducts.length - 6) * labelQuantity} additional labels
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                        <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="font-medium text-gray-700">No Products Selected</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Choose products from the list to see label previews
                        </p>
                      </div>
                    )
                  ) : (
                    // Custom text preview - vertical list
                    customText ? (
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {Array.from({ length: Math.min(labelQuantity, 8) }, (_, i) => (
                          <div key={i} className="transform transition-all duration-200 hover:scale-[1.02]">
                            {renderLabelPreview(undefined, customText)}
                          </div>
                        ))}
                        {labelQuantity > 8 && (
                          <div className="text-center py-4">
                            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
                              +{labelQuantity - 8} more labels
                            </Badge>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                        <Edit3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="font-medium text-gray-700">Enter Custom Text</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Add your custom text to see label previews
                        </p>
                      </div>
                    )
                  )}
                </div>

                {/* Enhanced Print Summary */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    Print Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Template:</span>
                      <span className="font-medium text-gray-900">{currentTemplate?.name || 'None'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-medium text-gray-900">{currentTemplate?.size || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items:</span>
                      <span className="font-medium text-gray-900">
                        {previewMode === 'product' ? selectedProducts.length : (customText ? 1 : 0)}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-600">Total labels:</span>
                      <span className="text-blue-600">
                        {previewMode === 'product'
                          ? selectedProducts.length * labelQuantity
                          : customText ? labelQuantity : 0
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Instructions */}
          {!loading && !error && (
            <div className="mt-6 bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Label Printing Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
                <div>
                  <h4 className="font-medium mb-2">Printing Options:</h4>
                  <ul className="space-y-1">
                    <li>• <strong>Print Labels:</strong> Direct print with auto-dialog</li>
                    <li>• <strong>Print Preview:</strong> Opens PDF in new tab</li>
                    <li>• <strong>Export PDF:</strong> Downloads file for later</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">For best results:</h4>
                  <ul className="space-y-1">
                    <li>• Use appropriate label size for your printer</li>
                    <li>• Check printer settings match template size</li>
                    <li>• Test print on regular paper first</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Label types:</h4>
                  <ul className="space-y-1">
                    <li>• Product labels: Include name, price, barcode</li>
                    <li>• Price tags: Quick pricing labels</li>
                    <li>• Custom labels: Any text or information</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
    </InventoryLayout>
  );
}
