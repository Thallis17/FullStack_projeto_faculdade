export interface Supplier {
  id: number;
  companyName: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  mainContact: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

export interface SupplierFormValues {
  companyName: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
  mainContact: string;
}

