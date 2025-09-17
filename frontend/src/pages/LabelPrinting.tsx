import { useState } from 'react';
import { InventoryLayout } from '@/layouts';
import { Printer, Settings, Download, Package, Tag, Edit3, Copy, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface LabelTemplate {
  id: string;
  name: string;
  size: string;
  fields: string[];
  layout: 'single' | 'grid';
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  category: string;
  barcode?: string;
}

export default function LabelPrinting() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('template1');
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [customText, setCustomText] = useState('');
  const [labelQuantity, setLabelQuantity] = useState(1);
  const [previewMode, setPreviewMode] = useState<'product' | 'custom'>('product');

  const templates: LabelTemplate[] = [
    {
      id: 'template1',
      name: 'Standard Product Label',
      size: '2" x 1"',
      fields: ['name', 'price', 'barcode'],
      layout: 'single'
    },
    {
      id: 'template2',
      name: 'Detailed Product Label',
      size: '3" x 2"',
      fields: ['name', 'sku', 'price', 'category', 'barcode'],
      layout: 'single'
    },
    {
      id: 'template3',
      name: 'Price Tag Only',
      size: '1.5" x 1"',
      fields: ['name', 'price'],
      layout: 'grid'
    },
    {
      id: 'template4',
      name: 'Barcode Label',
      size: '2" x 0.75"',
      fields: ['name', 'sku', 'barcode'],
      layout: 'single'
    }
  ];

  const products: Product[] = [
    {
      id: '1',
      name: 'iPhone 13',
      sku: 'IPH-13-128',
      price: 45000,
      category: 'Electronics',
      barcode: '123456789012'
    },
    {
      id: '2',
      name: 'Samsung Galaxy S21',
      sku: 'SAM-S21-256',
      price: 35000,
      category: 'Electronics',
      barcode: '234567890123'
    },
    {
      id: '3',
      name: 'OnePlus 9',
      sku: 'OPL-09-128',
      price: 30000,
      category: 'Electronics',
      barcode: '345678901234'
    }
  ];

  const currentTemplate = templates.find(t => t.id === selectedTemplate);

  const addProduct = (product: Product) => {
    if (!selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts(prev => [...prev, product]);
    }
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handlePrint = () => {
    if (previewMode === 'product' && selectedProducts.length === 0) {
      alert('Please select products to print labels');
      return;
    }
    if (previewMode === 'custom' && !customText) {
      alert('Please enter custom text for labels');
      return;
    }
    
    alert(`Printing ${labelQuantity} label(s) using ${currentTemplate?.name}...`);
  };

  const handleExport = (format: 'pdf' | 'png') => {
    alert(`Exporting labels as ${format.toUpperCase()}...`);
  };

  const renderLabelPreview = (product?: Product, customContent?: string) => {
    if (!currentTemplate) return null;

    return (
      <div className="border-2 border-dashed border-gray-300 bg-white p-4 rounded-lg text-center min-h-24 flex flex-col justify-center">
        {previewMode === 'product' && product ? (
          <div className="space-y-1">
            {currentTemplate.fields.includes('name') && (
              <p className="font-semibold text-sm truncate">{product.name}</p>
            )}
            {currentTemplate.fields.includes('sku') && (
              <p className="text-xs text-gray-600">SKU: {product.sku}</p>
            )}
            {currentTemplate.fields.includes('price') && (
              <p className="font-bold text-green-600">₹{product.price.toLocaleString()}</p>
            )}
            {currentTemplate.fields.includes('category') && (
              <Badge className="text-xs">{product.category}</Badge>
            )}
            {currentTemplate.fields.includes('barcode') && product.barcode && (
              <div className="mt-2">
                <div className="h-4 bg-gray-900 mx-auto max-w-20 text-white text-xs flex items-center justify-center">
                  ||||
                </div>
                <p className="text-xs font-mono mt-1">{product.barcode.slice(-8)}</p>
              </div>
            )}
          </div>
        ) : previewMode === 'custom' && customContent ? (
          <div className="space-y-1">
            <p className="text-sm">{customContent}</p>
          </div>
        ) : (
          <div className="text-gray-400">
            <Tag className="h-8 w-8 mx-auto mb-2" />
            <p className="text-xs">Label Preview</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <InventoryLayout activeSection="Label Printing">
      <div className="p-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Printer className="h-6 w-6 text-blue-600" />
                  Label Printing
                </h1>
                <p className="text-gray-600 mt-1">Create and print custom labels for your products</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleExport('png')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PNG
                </Button>
                <Button onClick={handlePrint}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Labels
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Settings */}
            <div className="space-y-6">
              {/* Template Selection */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Label Template
                </h3>
                
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedTemplate === template.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTemplate(template.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{template.name}</p>
                        <Badge variant="outline">{template.size}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Fields: {template.fields.join(', ')}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        {template.layout === 'grid' ? (
                          <Grid3X3 className="h-3 w-3 text-gray-400" />
                        ) : (
                          <Tag className="h-3 w-3 text-gray-400" />
                        )}
                        <span className="text-xs text-gray-500">
                          {template.layout === 'grid' ? 'Grid layout' : 'Single layout'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Print Settings */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Print Settings</h3>
                
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

            {/* Middle Column - Product Selection */}
            {previewMode === 'product' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Select Products</h3>
                
                <div className="space-y-3 mb-6">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-sm text-gray-600">₹{product.price.toLocaleString()}</p>
                          <Badge className="text-xs">{product.category}</Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addProduct(product)}
                        disabled={selectedProducts.some(p => p.id === product.id)}
                      >
                        Add
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Selected Products */}
                <div>
                  <h4 className="font-medium mb-3">Selected Products ({selectedProducts.length})</h4>
                  {selectedProducts.length > 0 ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {selectedProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-2 bg-blue-50 rounded-lg"
                        >
                          <span className="text-sm font-medium">{product.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge>{labelQuantity}x</Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeProduct(product.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No products selected</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Right Column - Preview */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Label Preview</h3>
                <Button size="sm" variant="outline">
                  <Copy className="h-4 w-4 mr-1" />
                  Duplicate
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    {currentTemplate?.name} ({currentTemplate?.size})
                  </p>
                  
                  {previewMode === 'product' ? (
                    selectedProducts.length > 0 ? (
                      <div className="space-y-4">
                        {selectedProducts.slice(0, 3).map((product) => (
                          <div key={product.id} className="space-y-2">
                            {Array.from({ length: Math.min(labelQuantity, 3) }, (_, i) => (
                              <div key={i}>
                                {renderLabelPreview(product)}
                              </div>
                            ))}
                          </div>
                        ))}
                        {selectedProducts.length > 3 && (
                          <div className="text-xs text-gray-500 mt-2">
                            ... and {selectedProducts.length - 3} more products
                          </div>
                        )}
                      </div>
                    ) : (
                      renderLabelPreview()
                    )
                  ) : (
                    <div className="space-y-2">
                      {Array.from({ length: Math.min(labelQuantity, 5) }, (_, i) => (
                        <div key={i}>
                          {renderLabelPreview(undefined, customText)}
                        </div>
                      ))}
                      {labelQuantity > 5 && (
                        <div className="text-xs text-gray-500 mt-2">
                          ... {labelQuantity - 5} more labels
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Print Summary */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Print Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Template:</span>
                      <span>{currentTemplate?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Items:</span>
                      <span>
                        {previewMode === 'product' 
                          ? `${selectedProducts.length} products`
                          : customText ? '1 custom label' : '0 items'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quantity per item:</span>
                      <span>{labelQuantity}x</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total labels:</span>
                      <span>
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

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Label Printing Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
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
        </div>
    </InventoryLayout>
  );
}
