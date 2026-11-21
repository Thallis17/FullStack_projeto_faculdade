import { Link2, Package, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertBanner } from '../../../shared/components/AlertBanner';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import { extractApiError, getImageUrl } from '../../../shared/services/api';
import { formatDateBR } from '../../../shared/utils/masks';
import { productService } from '../services/productService';
import { Product } from '../types/product.types';

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = useCallback(async (query?: string, category?: string) => {
    setLoading(true);
    try {
      const data = await productService.list({ search: query, category });
      setProducts(data);
    } catch (error) {
      setFeedback({ type: 'error', message: extractApiError(error).message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(search, categoryFilter);
    }, 200);
    return () => clearTimeout(timer);
  }, [search, categoryFilter, fetchProducts]);

  const availableCategories = Array.from(new Set(products.map((p) => p.category))).sort();

  async function handleConfirmDelete() {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      const response = await productService.remove(productToDelete.id);
      setFeedback({ type: 'success', message: response.message });
      setProductToDelete(null);
      await fetchProducts(search, categoryFilter);
    } catch (error) {
      setFeedback({ type: 'error', message: extractApiError(error).message });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Produtos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Controle o catálogo de produtos, quantidades em estoque e fornecedores vinculados.
          </p>
        </div>

        <Link
          to="/produtos/novo"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Novo Produto
        </Link>
      </div>

      {feedback && (
        <AlertBanner
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, código de barras ou descrição..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2 pr-3.5 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filtrar por categoria"
            className="rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">Todas as categorias</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">Carregando produtos...</div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Package className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-slate-900">
              Nenhum produto encontrado
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {search || categoryFilter
                ? 'Tente ajustar os filtros de busca.'
                : 'Cadastre seu primeiro produto para começar o controle de estoque.'}
            </p>
            {!search && !categoryFilter && (
              <Link
                to="/produtos/novo"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Cadastrar Produto
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-3.5">Produto</th>
                  <th className="px-5 py-3.5">Categoria</th>
                  <th className="px-5 py-3.5">Estoque</th>
                  <th className="px-5 py-3.5">Validade</th>
                  <th className="px-5 py-3.5">Fornecedores</th>
                  <th className="px-5 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => {
                  const thumbUrl = getImageUrl(product.imageUrl);
                  return (
                    <tr key={product.id} className="transition hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3.5">
                          {thumbUrl ? (
                            <img
                              src={thumbUrl}
                              alt={product.name}
                              className="h-11 w-11 shrink-0 rounded-xl border border-slate-200 object-cover"
                            />
                          ) : (
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                              <Package className="h-5 w-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900">{product.name}</p>
                            <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                              {product.description}
                            </p>
                            {product.barcode && (
                              <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                                Cód. Barras: {product.barcode}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            product.stockQuantity === 0
                              ? 'bg-rose-50 text-rose-700'
                              : product.stockQuantity <= 5
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {product.stockQuantity} un.
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-600">
                        {formatDateBR(product.expirationDate)}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                          {product._count?.suppliers ?? 0} vinculado(s)
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex flex-wrap items-center justify-end gap-2">
                          <Link
                            to={`/produtos/${product.id}/fornecedores`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                          >
                            <Link2 className="h-3.5 w-3.5" />
                            Associar Fornecedores
                          </Link>
                          <Link
                            to={`/produtos/${product.id}/editar`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Editar
                          </Link>
                          <button
                            type="button"
                            onClick={() => setProductToDelete(product)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(productToDelete)}
        title="Excluir produto"
        description={`Tem certeza que deseja excluir o produto "${productToDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setProductToDelete(null)}
      />
    </div>
  );
}

