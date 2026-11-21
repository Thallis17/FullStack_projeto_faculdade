import { api } from '../../../shared/services/api';
import { Supplier, SupplierFormValues } from '../types/supplier.types';

export const supplierService = {
  async list(search?: string): Promise<Supplier[]> {
    const response = await api.get<{ data: Supplier[] }>('/suppliers', {
      params: search ? { search } : undefined,
    });
    return response.data.data;
  },

  async findById(id: number): Promise<Supplier> {
    const response = await api.get<{ data: Supplier }>(`/suppliers/${id}`);
    return response.data.data;
  },

  async create(values: SupplierFormValues): Promise<{ message: string; data: Supplier }> {
    const response = await api.post<{ message: string; data: Supplier }>('/suppliers', values);
    return response.data;
  },

  async update(
    id: number,
    values: SupplierFormValues
  ): Promise<{ message: string; data: Supplier }> {
    const response = await api.put<{ message: string; data: Supplier }>(
      `/suppliers/${id}`,
      values
    );
    return response.data;
  },

  async remove(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/suppliers/${id}`);
    return response.data;
  },
};

