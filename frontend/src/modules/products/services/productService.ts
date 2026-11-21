import { api } from '../../../shared/services/api';
import { Product, ProductFormValues } from '../types/product.types';

function buildProductFormData(values: ProductFormValues): FormData {
  const formData = new FormData();
  formData.append('name', values.name);
  formData.append('barcode', values.barcode);
  formData.append('description', values.description);
  formData.append('stockQuantity', values.stockQuantity);
  formData.append('category', values.category);
  formData.append('customCategory', values.customCategory);
  formData.append('expirationDate', values.expirationDate);
  formData.append('removeImage', String(values.removeImage));

  if (values.imageFile) {
    formData.append('image', values.imageFile);
  }

  return formData;
}

export const productService = {
  async list(filters?: { search?: string; category?: string }): Promise<Product[]> {
    const response = await api.get<{ data: Product[] }>('/products', {
      params: {
        ...(filters?.search ? { search: filters.search } : {}),
        ...(filters?.category ? { category: filters.category } : {}),
      },
    });
    return response.data.data;
  },

  async findById(id: number): Promise<Product> {
    const response = await api.get<{ data: Product }>(`/products/${id}`);
    return response.data.data;
  },

  async create(values: ProductFormValues): Promise<{ message: string; data: Product }> {
    const response = await api.post<{ message: string; data: Product }>(
      '/products',
      buildProductFormData(values)
    );
    return response.data;
  },

  async update(
    id: number,
    values: ProductFormValues
  ): Promise<{ message: string; data: Product }> {
    const response = await api.put<{ message: string; data: Product }>(
      `/products/${id}`,
      buildProductFormData(values)
    );
    return response.data;
  },

  async remove(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/products/${id}`);
    return response.data;
  },
};

