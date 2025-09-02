import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

export function DebugAddProduct() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    console.log('Add Product button clicked!');
    setIsOpen(true);
  };

  return (
    <>
      <Button 
        onClick={handleClick}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <Plus className="h-4 w-4 mr-2" />
        Debug Add Product
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Debug Modal</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p>This is a test modal to verify the dialog functionality works correctly.</p>
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
