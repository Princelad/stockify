import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import AddProductForm from '@/components/forms/AddProductForm';
import { Plus } from 'lucide-react';

interface AddProductModalProps {
  onProductAdded?: (product: any) => void;
  trigger?: React.ReactNode;
}

export default function AddProductModal({ onProductAdded, trigger }: AddProductModalProps) {
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add New Product
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        <AddProductForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </DialogContent>
    </Dialog>
  );
}
