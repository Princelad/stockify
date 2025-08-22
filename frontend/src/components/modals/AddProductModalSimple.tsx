import { useState } from 'react';
import { Button } from '@/components/ui/button';
import AddProductForm from '@/components/forms/AddProductForm';
import { Plus, X } from 'lucide-react';

interface AddProductModalProps {
  onProductAdded?: (product: any) => void;
}

export default function AddProductModal({ onProductAdded }: AddProductModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = (product: any) => {
    setIsOpen(false);
    if (onProductAdded) {
      onProductAdded(product);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button 
        className="bg-blue-600 hover:bg-blue-700" 
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add New Product
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Add New Product</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCancel}
            className="p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <AddProductForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </div>
      </div>
    </div>
  );
}
