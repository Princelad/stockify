import { useState } from 'react';
import { Sidebar } from '@/components/inventory/Sidebar';
import { Topbar } from '@/components/inventory/Topbar';
import { Tag, Download, Search, Package, Hash, Copy, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  category: string;
}

export default function BarcodeGenerator() {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customBarcode, setCustomBarcode] = useState('');
  const [barcodeType, setBarcodeType] = useState('CODE128');
  const [generatedBarcodes, setGeneratedBarcodes] = useState<Array<{product: Product, barcode: string}>>([]);

  // Mock products data
  const products: Product[] = [
    {
      id: '1',
      name: 'iPhone 13',
      sku: 'IPH-13-128',
      barcode: '123456789012',
      price: 45000,
      category: 'Electronics'
    },
    {
      id: '2',
      name: 'Samsung Galaxy S21',
      sku: 'SAM-S21-256',
      price: 35000,
      category: 'Electronics'
    },
    {
      id: '3',
      name: 'OnePlus 9',
      sku: 'OPL-09-128',
      price: 30000,
      category: 'Electronics'
    },
    {
      id: '4',
      name: 'MacBook Air',
      sku: 'MAC-AIR-M1',
      barcode: '987654321098',
      price: 85000,
      category: 'Electronics'
    }
  ];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const barcodeTypes = [
    { value: 'CODE128', label: 'Code 128' },
    { value: 'CODE39', label: 'Code 39' },
    { value: 'EAN13', label: 'EAN-13' },
    { value: 'UPC', label: 'UPC-A' },
    { value: 'QR', label: 'QR Code' }
  ];

  const addToGeneration = (product: Product) => {
    if (!selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts(prev => [...prev, product]);
    }
  };

  const removeFromGeneration = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const generateBarcode = (text: string) => {
    // In a real app, you'd use a barcode generation library
    return `BARCODE_${text}_${Date.now()}`;
  };

  const handleGenerateBarcodes = () => {
    const newBarcodes = selectedProducts.map(product => ({
      product,
      barcode: product.barcode || generateBarcode(product.sku)
    }));
    
    setGeneratedBarcodes(newBarcodes);
    
    // Update products with generated barcodes
    selectedProducts.forEach(product => {
      if (!product.barcode) {
        product.barcode = generateBarcode(product.sku);
      }
    });
  };

  const handleGenerateCustomBarcode = () => {
    if (customBarcode) {
      const customProduct: Product = {
        id: 'custom',
        name: 'Custom Item',
        sku: customBarcode,
        barcode: generateBarcode(customBarcode),
        price: 0,
        category: 'Custom'
      };
      
      setGeneratedBarcodes([{
        product: customProduct,
        barcode: customProduct.barcode!
      }]);
    }
  };

  const handlePrint = () => {
    alert('Printing barcodes... (In a real app, this would trigger the print dialog)');
  };

  const handleDownload = (format: 'png' | 'svg' | 'pdf') => {
    alert(`Downloading barcodes as ${format.toUpperCase()}... (Integration with barcode library needed)`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeSection="Barcode Generator" />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Tag className="h-6 w-6 text-blue-600" />
                  Barcode Generator
                </h1>
                <p className="text-gray-600 mt-1">Generate barcodes for your products and inventory</p>
              </div>
              <div className="flex gap-2">
                {generatedBarcodes.length > 0 && (
                  <>
                    <Button variant="outline" onClick={handlePrint}>
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                    <Button onClick={() => handleDownload('pdf')}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Product Selection */}
            <div className="space-y-6">
              {/* Product Selection */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Select Products
                </h3>
                
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search products by name or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                          {product.barcode && (
                            <Badge className="bg-green-100 text-green-800">Has Barcode</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">₹{product.price.toLocaleString()}</p>
                        <Button
                          size="sm"
                          onClick={() => addToGeneration(product)}
                          disabled={selectedProducts.some(p => p.id === product.id)}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Barcode */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Generate Custom Barcode
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customBarcode">Enter Text/Code</Label>
                    <Input
                      id="customBarcode"
                      value={customBarcode}
                      onChange={(e) => setCustomBarcode(e.target.value)}
                      placeholder="Enter text to generate barcode"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="barcodeType">Barcode Type</Label>
                    <select
                      id="barcodeType"
                      value={barcodeType}
                      onChange={(e) => setBarcodeType(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      {barcodeTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <Button 
                    onClick={handleGenerateCustomBarcode}
                    disabled={!customBarcode}
                    className="w-full"
                  >
                    Generate Custom Barcode
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Generation & Preview */}
            <div className="space-y-6">
              {/* Selected Products */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Selected Products ({selectedProducts.length})</h3>
                  {selectedProducts.length > 0 && (
                    <Button onClick={handleGenerateBarcodes}>
                      Generate Barcodes
                    </Button>
                  )}
                </div>
                
                {selectedProducts.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromGeneration(product.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Tag className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No products selected</p>
                    <p className="text-sm">Select products from the list to generate barcodes</p>
                  </div>
                )}
              </div>

              {/* Generated Barcodes */}
              {generatedBarcodes.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Generated Barcodes</h3>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDownload('png')}
                      >
                        PNG
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDownload('svg')}
                      >
                        SVG
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleDownload('pdf')}
                      >
                        PDF
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {generatedBarcodes.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-gray-600">SKU: {item.product.sku}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(item.barcode)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Barcode Preview */}
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                          <div className="mb-2">
                            {/* In a real app, this would be an actual barcode image */}
                            <div className="h-16 bg-gray-900 mx-auto max-w-48 flex items-center justify-center text-white text-xs font-mono">
                              ||||| |||| ||| |||| |||||
                            </div>
                          </div>
                          <p className="text-sm font-mono text-gray-600">{item.barcode}</p>
                          <p className="text-xs text-gray-500 mt-1">Type: {barcodeType}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">How to use Barcode Generator</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h4 className="font-medium mb-2">For Products:</h4>
                <ul className="space-y-1">
                  <li>• Search and select products from your inventory</li>
                  <li>• Products without barcodes will get auto-generated ones</li>
                  <li>• Existing barcodes will be preserved</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">For Custom Items:</h4>
                <ul className="space-y-1">
                  <li>• Enter any text or number sequence</li>
                  <li>• Choose appropriate barcode type</li>
                  <li>• Generate instant barcode for printing</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
