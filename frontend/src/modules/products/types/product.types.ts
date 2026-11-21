export const PREDEFINED_CATEGORIES = [
  'Eletrônicos',
  'Alimentos',
  'Vestuário',
  'Limpeza',
  'Escritório',
  'Ferramentas',
  'Higiene e Saúde',
  'Outro',
] as const;

export interface Product {
  id: number;
  name: string;
  barcode: string | null;
  description: string;
  stockQuantity: number;
  category: string;
  expirationDate: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    suppliers: number;
  };
}

export interface ProductFormValues {
  name: string;
  barcode: string;
  description: string;
  stockQuantity: string;
  category: string;
  customCategory: string;
  expirationDate: string;
  imageFile: File | null;
  existingImageUrl: string | null;
  removeImage: boolean;
}

