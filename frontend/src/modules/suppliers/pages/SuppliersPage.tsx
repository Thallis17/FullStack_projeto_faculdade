import { Building2, Mail, Pencil, Phone, Plus, Search, Trash2, User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertBanner } from '../../../shared/components/AlertBanner';
import { ConfirmModal } from '../../../shared/components/ConfirmModal';
import { extractApiError } from '../../../shared/services/api';
import { supplierService } from '../services/supplierService';
import { Supplier } from '../types/supplier.types';

export function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSuppliers = useCallback(async (query?: string) => {
    setLoading(true);
    try {
      const data = await supplierService.list(query);
      setSuppliers(data);
    } catch (error) {
      setFeedback({ type: 'error', message: extractApiError(error).message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuppliers(search);
    }, 200);
    return () => clearTimeout(timer);
  }, [search, fetchSuppliers]);

  async function handleConfirmDelete() {
    if (!supplierToDelete) return;
    setIsDeleting(true);
    try {
      const response = await supplierService.remove(supplierToDelete.id);
      setFeedback({ type: 'success', message: response.message });
      setSupplierToDelete(null);
      await fetchSuppliers(search);
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Fornecedores</h1>
          <p className="mt-1 text-sm text-slate-500">
            Gerencie e rastreie todos os fornecedores cadastrados no sistema.
          </p>
        </div>

        <Link
          to="/fornecedores/novo"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Novo Fornecedor
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
        <div className="border-b border-slate-200 p-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por empresa, CNPJ, e-mail ou contato..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2 pr-3.5 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">Carregando fornecedores...</div>
        ) : suppliers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-slate-900">
              Nenhum fornecedor encontrado
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {search
                ? 'Tente ajustar o termo de busca.'
                : 'Cadastre seu primeiro fornecedor para começar a associar produtos.'}
            </p>
            {!search && (
              <Link
                to="/fornecedores/novo"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4" />
                Cadastrar Fornecedor
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-3.5">Empresa / CNPJ</th>
                  <th className="px-5 py-3.5">Contato</th>
                  <th className="px-5 py-3.5">Produtos</th>
                  <th className="px-5 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suppliers.map((supplier) => (
                  <tr key={supplier.id} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{supplier.companyName}</p>
                      <p className="mt-0.5 font-mono text-xs text-slate-500">{supplier.cnpj}</p>
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500">{supplier.address}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1 text-xs text-slate-600">
                        <p className="flex items-center gap-1.5 font-medium text-slate-800">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          {supplier.mainContact}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          {supplier.phone}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          {supplier.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                        {supplier._count?.products ?? 0} produto(s)
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          to={`/fornecedores/${supplier.id}/editar`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Editar
                        </Link>
                        <button
                          type="button"
                          onClick={() => setSupplierToDelete(supplier)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={Boolean(supplierToDelete)}
        title="Excluir fornecedor"
        description={`Tem certeza que deseja excluir "${supplierToDelete?.companyName}"? Todas as associações com produtos vinculadas a ele também serão removidas.`}
        confirmLabel="Excluir"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setSupplierToDelete(null)}
      />
    </div>
  );
}

