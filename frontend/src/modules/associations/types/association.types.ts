import { Product } from '../../products/types/product.types';
import { Supplier } from '../../suppliers/types/supplier.types';

export interface AssociatedSupplier extends Supplier {
  associationId: number;
  associatedAt: string;
}

export interface ProductAssociationData {
  product: Pick<
    Product,
    | 'id'
    | 'name'
    | 'barcode'
    | 'description'
    | 'stockQuantity'
    | 'category'
    | 'expirationDate'
    | 'imageUrl'
  >;
  associatedSuppliers: AssociatedSupplier[];
}

export interface DashboardSummary {
  metrics: {
    totalProducts: number;
    totalStockUnits: number;
    totalSuppliers: number;
    totalAssociations: number;
  };
  recentProducts: Product[];
  recentSuppliers: Supplier[];
}

