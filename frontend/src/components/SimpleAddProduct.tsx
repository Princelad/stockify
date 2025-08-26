import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SimpleAddProductProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const SimpleAddProduct: React.FC<SimpleAddProductProps> = ({ 
  onSuccess, 
  onCancel
}) => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add New Product</h2>
        <p className="text-gray-600">Simple form to test the modal functionality</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="productName">Product Name</Label>
          <Input 
            id="productName" 
            placeholder="Enter product name"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="productPrice">Price</Label>
          <Input 
            id="productPrice" 
            type="number"
            placeholder="0.00"
            className="mt-1"
          />
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 mt-6">
        <Button 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          onClick={onSuccess}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Save Product
        </Button>
      </div>
    </div>
  );
};

export default SimpleAddProduct;
