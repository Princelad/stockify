import { z } from 'zod';

// Supplier schema
const supplierSchema = z.object({
  name: z.string()
    .min(2, 'Supplier name must be at least 2 characters')
    .max(100, 'Supplier name cannot exceed 100 characters')
    .trim(),
  contact: z.string()
    .optional()
    .refine((val: string | undefined) => !val || val.length >= 10, 'Contact must be at least 10 characters'),
  email: z.string()
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
  address: z.string()
    .optional()
    .refine((val: string | undefined) => !val || val.length <= 255, 'Address cannot exceed 255 characters'),
});

// Dimensions schema
const dimensionsSchema = z.object({
  length: z.number().min(0, 'Length must be positive').optional(),
  width: z.number().min(0, 'Width must be positive').optional(),
  height: z.number().min(0, 'Height must be positive').optional(),
});

// Main product schema
export const productSchema = z.object({
  // Basic Information
  name: z.string()
    .min(2, 'Product name must be at least 2 characters')
    .max(100, 'Product name cannot exceed 100 characters')
    .trim(),
    
  description: z.string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
    
  sku: z.string()
    .min(2, 'SKU must be at least 2 characters')
    .max(50, 'SKU cannot exceed 50 characters')
    .regex(/^[A-Za-z0-9-_]+$/, 'SKU can only contain letters, numbers, hyphens, and underscores')
    .trim(),
    
  category: z.string()
    .min(2, 'Category must be at least 2 characters')
    .max(50, 'Category cannot exceed 50 characters')
    .trim(),
    
  brand: z.string()
    .max(50, 'Brand cannot exceed 50 characters')
    .optional(),
    
  barcode: z.string()
    .regex(/^[0-9]+$/, 'Barcode can only contain numbers')
    .optional()
    .or(z.literal('')),
    
  // Pricing (all required for business logic)
  costPrice: z.number()
    .min(0.01, 'Cost price must be greater than 0')
    .max(1000000, 'Cost price cannot exceed 1,000,000'),
    
  sellingPrice: z.number()
    .min(0.01, 'Selling price must be greater than 0')
    .max(1000000, 'Selling price cannot exceed 1,000,000'),
    
  wholesalePrice: z.number()
    .min(0, 'Wholesale price must be positive')
    .max(1000000, 'Wholesale price cannot exceed 1,000,000')
    .optional(),
    
  // Stock Management
  currentStock: z.number()
    .min(0, 'Stock cannot be negative')
    .max(1000000, 'Stock cannot exceed 1,000,000'),
    
  minStockLevel: z.number()
    .min(0, 'Minimum stock level cannot be negative')
    .max(10000, 'Minimum stock level cannot exceed 10,000'),
    
  maxStockLevel: z.number()
    .min(0, 'Maximum stock level cannot be negative')
    .max(1000000, 'Maximum stock level cannot exceed 1,000,000')
    .optional(),
    
  // Supplier Information
  supplier: supplierSchema,
  
  // Physical Properties
  weight: z.number()
    .min(0, 'Weight cannot be negative')
    .max(10000, 'Weight cannot exceed 10,000 kg')
    .optional(),
    
  dimensions: dimensionsSchema.optional(),
  
  // Additional
  images: z.array(z.string().url('Invalid image URL')).optional(),
  
}).refine((data: any) => {
  // Ensure selling price is greater than cost price
  return data.sellingPrice > data.costPrice;
}, {
  message: 'Selling price must be greater than cost price',
  path: ['sellingPrice'],
}).refine((data: any) => {
  // If wholesale price exists, it should be between cost and selling price
  if (data.wholesalePrice !== undefined && data.wholesalePrice > 0) {
    return data.wholesalePrice >= data.costPrice && data.wholesalePrice <= data.sellingPrice;
  }
  return true;
}, {
  message: 'Wholesale price must be between cost price and selling price',
  path: ['wholesalePrice'],
}).refine((data: any) => {
  // If max stock level exists, it should be greater than min stock level
  if (data.maxStockLevel !== undefined) {
    return data.maxStockLevel >= data.minStockLevel;
  }
  return true;
}, {
  message: 'Maximum stock level must be greater than minimum stock level',
  path: ['maxStockLevel'],
}).refine((data: any) => {
  // Current stock should ideally be between min and max levels (warning, not error)
  if (data.maxStockLevel !== undefined) {
    return data.currentStock <= data.maxStockLevel;
  }
  return true;
}, {
  message: 'Current stock exceeds maximum stock level',
  path: ['currentStock'],
});

// Export the inferred type
export type ProductFormData = z.infer<typeof productSchema>;

// Validation helper function
export const validateProduct = (data: any) => {
  try {
    const validData = productSchema.parse(data);
    return { success: true, data: validData, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.issues.reduce((acc: Record<string, string>, curr: any) => {
        const path = curr.path.join('.');
        acc[path] = curr.message;
        return acc;
      }, {} as Record<string, string>);
      
      return { success: false, data: null, errors: formattedErrors };
    }
    return { success: false, data: null, errors: { general: 'Validation failed' } };
  }
};

// Field-specific validation helpers
export const validateSKU = (sku: string) => {
  const result = z.string().regex(/^[A-Za-z0-9-_]+$/).safeParse(sku);
  return result.success;
};

export const validatePrice = (price: number) => {
  const result = z.number().min(0.01).max(1000000).safeParse(price);
  return result.success;
};

export const validateStock = (stock: number) => {
  const result = z.number().min(0).max(1000000).safeParse(stock);
  return result.success;
};
