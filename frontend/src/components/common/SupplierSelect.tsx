import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Building2, Loader2 } from 'lucide-react';
import { apiService } from '@/lib/api';
import { useToast } from '@/hooks/useToast';
import type { Supplier } from '@/types/product';

interface SupplierSelectProps {
  value?: Supplier | null;
  onSelect: (supplier: Supplier) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  label?: string;
}

interface CreateSupplierData {
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  paymentTerms: string;
  category: string;
}

export default function SupplierSelect({ 
  value, 
  onSelect, 
  placeholder = "Select supplier", 
  disabled = false,
  required = false,
  label = "Supplier"
}: SupplierSelectProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateSupplierData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    contactPerson: '',
    paymentTerms: '30 days',
    category: 'Electronics'
  });

  const { toast } = useToast();
  const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Beauty'];

  // Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSuppliers();
      if (response.success && response.data) {
        setSuppliers(response.data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch suppliers",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (creating) return;
    
    setCreating(true);
    
    try {
      const response = await apiService.createSupplier(createFormData);
      
      if (response.success && response.data) {
        const newSupplier = response.data as Supplier;
        setSuppliers(prev => [newSupplier, ...prev]);
        onSelect(newSupplier);
        
        toast({
          title: "Success",
          description: "Supplier created successfully",
          type: "success",
        });
        
        // Reset form and close dialog
        setCreateFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          contactPerson: '',
          paymentTerms: '30 days',
          category: 'Electronics'
        });
        setIsCreateDialogOpen(false);
      } else {
        throw new Error(response.message || "Failed to create supplier");
      }
    } catch (error) {
      console.error('Error creating supplier:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create supplier",
        type: "error",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleSupplierChange = (supplierId: string) => {
    const selectedSupplier = suppliers.find(s => s._id === supplierId);
    if (selectedSupplier) {
      onSelect(selectedSupplier);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center">
        <Building2 className="h-4 w-4 mr-1" />
        {label} {required && '*'}
      </Label>
      
      <div className="flex gap-2">
        <div className="flex-1">
          <Select
            value={value?._id || ''}
            onValueChange={handleSupplierChange}
            disabled={disabled || loading}
          >
            <SelectTrigger>
              <SelectValue placeholder={loading ? "Loading suppliers..." : placeholder} />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <SelectItem value="loading" disabled>
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </div>
                </SelectItem>
              ) : suppliers.length === 0 ? (
                <SelectItem value="no-suppliers" disabled>
                  <div className="text-gray-500 text-sm">No suppliers available</div>
                </SelectItem>
              ) : (
                suppliers.map((supplier) => (
                  <SelectItem key={supplier._id} value={supplier._id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{supplier.name}</span>
                      {supplier.email && (
                        <span className="text-xs text-gray-500">{supplier.email}</span>
                      )}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="sm" disabled={disabled}>
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <form onSubmit={handleCreateSupplier}>
              <DialogHeader>
                <DialogTitle>Add New Supplier</DialogTitle>
                <DialogDescription>
                  Create a new supplier profile for your inventory
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">Company Name *</Label>
                  <Input
                    id="create-name"
                    value={createFormData.name}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter company name"
                    required
                    disabled={creating}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="create-contactPerson">Contact Person</Label>
                  <Input
                    id="create-contactPerson"
                    value={createFormData.contactPerson}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                    placeholder="Enter contact person"
                    disabled={creating}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="create-email">Email</Label>
                  <Input
                    id="create-email"
                    type="email"
                    value={createFormData.email}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                    disabled={creating}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="create-phone">Phone *</Label>
                  <Input
                    id="create-phone"
                    value={createFormData.phone}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                    required
                    disabled={creating}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="create-address">Address</Label>
                  <Input
                    id="create-address"
                    value={createFormData.address}
                    onChange={(e) => setCreateFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter address"
                    disabled={creating}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-category">Category</Label>
                    <select
                      id="create-category"
                      value={createFormData.category}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full p-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={creating}
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="create-paymentTerms">Payment Terms</Label>
                    <select
                      id="create-paymentTerms"
                      value={createFormData.paymentTerms}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                      className="w-full p-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={creating}
                    >
                      <option value="15 days">15 days</option>
                      <option value="30 days">30 days</option>
                      <option value="45 days">45 days</option>
                      <option value="60 days">60 days</option>
                      <option value="Cash on delivery">Cash on delivery</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Supplier'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {value && (
        <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded border">
          <div className="font-medium">{value.name}</div>
          {value.contactPerson && <div>Contact: {value.contactPerson}</div>}
          {value.email && <div>Email: {value.email}</div>}
          {value.phone && <div>Phone: {value.phone}</div>}
        </div>
      )}
    </div>
  );
}