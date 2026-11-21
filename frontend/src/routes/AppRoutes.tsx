import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { DashboardPage } from '../modules/associations/pages/DashboardPage';
import { ProductAssociationPage } from '../modules/associations/pages/ProductAssociationPage';
import { ProductFormPage } from '../modules/products/pages/ProductFormPage';
import { ProductsPage } from '../modules/products/pages/ProductsPage';
import { SupplierFormPage } from '../modules/suppliers/pages/SupplierFormPage';
import { SuppliersPage } from '../modules/suppliers/pages/SuppliersPage';
import { Layout } from '../shared/components/Layout';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />

          {/* Módulo de Fornecedores */}
          <Route path="/fornecedores" element={<SuppliersPage />} />
          <Route path="/fornecedores/novo" element={<SupplierFormPage />} />
          <Route path="/fornecedores/:id/editar" element={<SupplierFormPage />} />

          {/* Módulo de Produtos */}
          <Route path="/produtos" element={<ProductsPage />} />
          <Route path="/produtos/novo" element={<ProductFormPage />} />
          <Route path="/produtos/:id/editar" element={<ProductFormPage />} />

          {/* Módulo de Associação Fornecedor ↔ Produto */}
          <Route path="/produtos/:id/fornecedores" element={<ProductAssociationPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

