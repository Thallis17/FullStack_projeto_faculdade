import { api } from '../../../shared/services/api';
import { DashboardSummary, ProductAssociationData } from '../types/association.types';

export const associationService = {
  async getDashboard(): Promise<DashboardSummary> {
    const response = await api.get<{ data: DashboardSummary }>('/dashboard');
    return response.data.data;
  },

  async getProductAssociations(productId: number): Promise<ProductAssociationData> {
    const response = await api.get<{ data: ProductAssociationData }>(
      `/products/${productId}/suppliers`
    );
    return response.data.data;
  },

  async associate(productId: number, supplierId: number): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      `/products/${productId}/suppliers`,
      { supplierId }
    );
    return response.data;
  },

  async disassociate(productId: number, supplierId: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `/products/${productId}/suppliers/${supplierId}`
    );
    return response.data;
  },
};

