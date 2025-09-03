import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Eye, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Types
interface ExtractedProduct {
  name: string;
  sku?: string;
  sellingPrice: number;
  costPrice?: number;
  currentStock?: number;
  category?: string;
  brand?: string;
  description?: string;
  supplier?: {
    name: string;
    contact: string;
    email: string;
    address: string;
  };
}

interface ExtractionSummary {
  totalProducts: number;
  confidence: number;
  method: string;
  fieldsFound: {
    [key: string]: {
      count: number;
      percentage: number;
    };
  };
}

interface PDFImportResponse {
  success: boolean;
  message: string;
  data: {
    extractionSummary: ExtractionSummary;
    products: ExtractedProduct[];
    preview: ExtractedProduct[];
    supplierInfo: {
      name: string;
      contact: string;
      email: string;
      address: string;
    };
    recommendations: {
      totalProducts: number;
      estimatedSuccessRate: number;
      fieldCoverage: any;
      suggestedActions: string[];
    };
  };
}

interface PDFBulkImportProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PDFBulkImport: React.FC<PDFBulkImportProps> = ({ onSuccess, onCancel }) => {
  // State management
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'edit' | 'confirm' | 'success'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionResults, setExtractionResults] = useState<PDFImportResponse['data'] | null>(null);
  const [supplierInfo, setSupplierInfo] = useState({
    name: 'PDF Import',
    contact: '',
    email: '',
    address: ''
  });
  const [importOptions, setImportOptions] = useState({
    updateExisting: false,
    defaultCategory: 'Imported',
    priceType: 'selling' as 'selling' | 'cost'
  });
  const [editedProducts, setEditedProducts] = useState<ExtractedProduct[]>([]);
  const [importStats, setImportStats] = useState<any>(null);

  // File handling
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please select a PDF file');
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please select a PDF file');
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  }, []);

  // PDF Processing
  const processPDF = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('pdfFile', selectedFile);
    formData.append('supplierName', supplierInfo.name);
    formData.append('supplierContact', supplierInfo.contact);
    formData.append('supplierEmail', supplierInfo.email);
    formData.append('supplierAddress', supplierInfo.address);
    formData.append('defaultCategory', importOptions.defaultCategory);
    formData.append('priceType', importOptions.priceType);

    try {
      const response = await fetch('/api/products/pdf-import/process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result: PDFImportResponse = await response.json();

      if (result.success) {
        setExtractionResults(result.data);
        setEditedProducts(result.data.products);
        setCurrentStep('preview');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('PDF processing error:', error);
      alert('Error processing PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Preview PDF without processing
  const previewPDF = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    const formData = new FormData();
    formData.append('pdfFile', selectedFile);

    try {
      const response = await fetch('/api/products/pdf-import/preview', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        // Show preview modal or update UI with preview data
        console.log('Preview data:', result.data);
        alert(`Preview: Found ${result.data.sampleProducts.length} products with ${result.data.recommendations.confidence * 100}% confidence`);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('PDF preview error:', error);
      alert('Error previewing PDF: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Confirm import
  const confirmImport = async () => {
    if (!editedProducts.length) return;

    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/products/pdf-import/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          products: editedProducts,
          supplierInfo,
          importOptions
        })
      });

      const result = await response.json();

      if (result.success) {
        setImportStats(result.data);
        setCurrentStep('success');
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 2000); // Delay to show success message
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Import confirmation error:', error);
      alert('Error confirming import: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Product editing
  const updateProduct = (index: number, field: string, value: any) => {
    const updated = [...editedProducts];
    updated[index] = { ...updated[index], [field]: value };
    setEditedProducts(updated);
  };

  const removeProduct = (index: number) => {
    const updated = editedProducts.filter((_, i) => i !== index);
    setEditedProducts(updated);
  };

  // Reset to start over
  const resetImport = () => {
    setCurrentStep('upload');
    setSelectedFile(null);
    setExtractionResults(null);
    setEditedProducts([]);
    setImportStats(null);
    
    // Call onCancel callback if provided
    if (onCancel) {
      onCancel();
    }
  };

  // Render functions
  const renderUploadStep = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">PDF Bulk Product Import</h2>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
      
      {/* Supplier Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Supplier Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Supplier Name *</label>
            <input
              type="text"
              value={supplierInfo.name}
              onChange={(e) => setSupplierInfo(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter supplier name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Contact</label>
            <input
              type="text"
              value={supplierInfo.contact}
              onChange={(e) => setSupplierInfo(prev => ({ ...prev, contact: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Phone/Mobile number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={supplierInfo.email}
              onChange={(e) => setSupplierInfo(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="supplier@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Address</label>
            <textarea
              value={supplierInfo.address}
              onChange={(e) => setSupplierInfo(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Supplier address"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Import Options */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Import Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Default Category</label>
            <input
              type="text"
              value={importOptions.defaultCategory}
              onChange={(e) => setImportOptions(prev => ({ ...prev, defaultCategory: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Price Type</label>
            <select
              value={importOptions.priceType}
              onChange={(e) => setImportOptions(prev => ({ ...prev, priceType: e.target.value as 'selling' | 'cost' }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="selling">Selling Price</option>
              <option value="cost">Cost Price</option>
            </select>
          </div>
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={importOptions.updateExisting}
                onChange={(e) => setImportOptions(prev => ({ ...prev, updateExisting: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm">Update existing products</span>
            </label>
          </div>
        </div>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Upload PDF File</h3>
        
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          
          {selectedFile ? (
            <div className="space-y-2">
              <p className="text-green-600 font-medium">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-600">Drop your PDF file here or click to select</p>
              <p className="text-sm text-gray-500">Support for product catalogs, invoices, and price lists</p>
            </div>
          )}
          
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="pdf-upload"
          />
          <label
            htmlFor="pdf-upload"
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600"
          >
            <Upload className="mr-2 h-4 w-4" />
            Select PDF File
          </label>
        </div>

        {selectedFile && (
          <div className="mt-6 flex space-x-4">
            <button
              onClick={previewPDF}
              disabled={isProcessing}
              className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview Extraction
            </button>
            
            <button
              onClick={processPDF}
              disabled={isProcessing || !supplierInfo.name}
              className="flex items-center px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {isProcessing ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {isProcessing ? 'Processing...' : 'Process PDF'}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderPreviewStep = () => {
    if (!extractionResults) return null;

    const { extractionSummary, products, recommendations } = extractionResults;

    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">PDF Extraction Results</h2>
          <button
            onClick={resetImport}
            className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Start Over
          </button>
        </div>

        {/* Extraction Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Extraction Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{extractionSummary.totalProducts}</div>
              <div className="text-sm text-gray-600">Products Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(extractionSummary.confidence * 100)}%
              </div>
              <div className="text-sm text-gray-600">Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-700">{extractionSummary.method.replace('_', ' ')}</div>
              <div className="text-sm text-gray-600">Method Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(extractionSummary.fieldsFound).length}
              </div>
              <div className="text-sm text-gray-600">Fields Found</div>
            </div>
          </div>
        </div>

        {/* Field Coverage */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Field Coverage Analysis</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(extractionSummary.fieldsFound).map(([field, data]) => (
              <div key={field} className="text-center">
                <div className="text-lg font-semibold">{data.percentage}%</div>
                <div className="text-sm text-gray-600 capitalize">{field}</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className={`h-2 rounded-full ${
                      data.percentage >= 80 ? 'bg-green-500' :
                      data.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${data.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.suggestedActions.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-yellow-800">Recommendations</h4>
                <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                  {recommendations.suggestedActions.map((action, index) => (
                    <li key={index}>• {action}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Product Preview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Extracted Products Preview</h3>
            <div className="text-sm text-gray-600">
              Showing first 5 of {products.length} products
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">SKU</th>
                  <th className="px-4 py-2 text-left">Price</th>
                  <th className="px-4 py-2 text-left">Stock</th>
                  <th className="px-4 py-2 text-left">Category</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 5).map((product, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">{product.name || 'N/A'}</td>
                    <td className="px-4 py-2">{product.sku || 'Auto-generated'}</td>
                    <td className="px-4 py-2">₹{product.sellingPrice || 0}</td>
                    <td className="px-4 py-2">{product.currentStock || 0}</td>
                    <td className="px-4 py-2">{product.category || importOptions.defaultCategory}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setCurrentStep('edit')}
              className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              <Eye className="mr-2 h-4 w-4" />
              Review & Edit Products
            </button>
            
            <button
              onClick={confirmImport}
              disabled={isProcessing}
              className="flex items-center px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              {isProcessing ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              {isProcessing ? 'Importing...' : 'Import All Products'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderEditStep = () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Review & Edit Products</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentStep('preview')}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Back to Preview
          </button>
          <button
            onClick={confirmImport}
            disabled={isProcessing}
            className="flex items-center px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            {isProcessing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
            Import {editedProducts.length} Products
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Name *</th>
                <th className="px-4 py-2 text-left">SKU</th>
                <th className="px-4 py-2 text-left">Selling Price *</th>
                <th className="px-4 py-2 text-left">Cost Price</th>
                <th className="px-4 py-2 text-left">Stock</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {editedProducts.map((product, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) => updateProduct(index, 'name', e.target.value)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={product.sku || ''}
                      onChange={(e) => updateProduct(index, 'sku', e.target.value)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Auto-generated"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={product.sellingPrice}
                      onChange={(e) => updateProduct(index, 'sellingPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      step="0.01"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={product.costPrice || 0}
                      onChange={(e) => updateProduct(index, 'costPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      step="0.01"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={product.currentStock || 0}
                      onChange={(e) => updateProduct(index, 'currentStock', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={product.category || ''}
                      onChange={(e) => updateProduct(index, 'category', e.target.value)}
                      className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => removeProduct(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="max-w-4xl mx-auto p-6 text-center">
      <div className="bg-green-50 rounded-lg p-8 mb-6">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-green-800 mb-2">Import Successful!</h2>
        <p className="text-green-700">Your products have been successfully imported from the PDF.</p>
      </div>

      {importStats && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Import Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{importStats.summary.successful}</div>
              <div className="text-sm text-gray-600">Successful</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{importStats.summary.failed}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{importStats.summary.duplicates}</div>
              <div className="text-sm text-gray-600">Duplicates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{importStats.summary.updated}</div>
              <div className="text-sm text-gray-600">Updated</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center space-x-4">
        <button
          onClick={resetImport}
          className="flex items-center px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Upload className="mr-2 h-4 w-4" />
          Import Another PDF
        </button>
        
        <button
          onClick={() => window.location.href = '/inventory'}
          className="flex items-center px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          <Eye className="mr-2 h-4 w-4" />
          View Inventory
        </button>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-8">
            {[
              { step: 'upload', label: 'Upload PDF', icon: Upload },
              { step: 'preview', label: 'Preview', icon: Eye },
              { step: 'edit', label: 'Edit Products', icon: FileText },
              { step: 'success', label: 'Complete', icon: CheckCircle }
            ].map(({ step, label, icon: Icon }) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep === step ? 'bg-blue-500 text-white' :
                  ['preview', 'edit', 'success'].indexOf(currentStep) > ['upload', 'preview', 'edit', 'success'].indexOf(step) 
                    ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className={`ml-2 text-sm ${
                  currentStep === step ? 'text-blue-600 font-medium' : 'text-gray-600'
                }`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 'upload' && renderUploadStep()}
      {currentStep === 'preview' && renderPreviewStep()}
      {currentStep === 'edit' && renderEditStep()}
      {currentStep === 'success' && renderSuccessStep()}
    </div>
  );
};

export default PDFBulkImport;
