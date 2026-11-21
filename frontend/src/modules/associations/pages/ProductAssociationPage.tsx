import { ArrowLeft, Building2, Link2, Package, Unlink } from 'lucide-react';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertBanner } from '../../../shared/components/AlertBanner';
import { extractApiError, getImageUrl } from '../../../shared/services/api';
import { supplierService } from '../../suppliers/services/supplierService';
import { Supplier } from '../../suppliers/types/supplier.types';
import { associationService } from '../services/associationService';
import { ProductAssociationData } from '../types/association.types';

export function ProductAssociationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const productId = Number(id);

  const [data, setData] = useState<ProductAssociationData | null>(null);
  const [allSuppliers, setAllSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [isAssociating, setIsAssociating] = useState(false);
  const [removingSupplierId, setRemovingSupplierId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [associationData, suppliers] = await Promise.all([
        associationService.getProductAssociations(productId),
        supplierService.list(),
      ]);
      setData(associationData);
      setAllSuppliers(suppliers);
    } catch (error) {
      setLoadError(extractApiError(error).message);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (!Number.isInteger(productId) || productId <= 0) {
      setLoadError('Identificador de produto inválido.');
      setLoading(false);
      return;
    }
    loadData();
  }, [productId, loadData]);

  async function handleAssociate(event: FormEvent) {
    event.preventDefault();
    setFeedback(null);

    if (!selectedSupplierId) {
      setFeedback({
        type: 'error',
        message: 'Selecione um fornecedor para associar ao produto.',
      });
      return;
    }

    setIsAssociating(true);
    try {
      const response = await associationService.associate(
        productId,
        Number(selectedSupplierId)
      );
      setFeedback({ type: 'success', message: response.message });
      setSelectedSupplierId('');
      const refreshed = await associationService.getProductAssociations(productId);
      setData(refreshed);
    } catch (error) {
      setFeedback({ type: 'error', message: extractApiError(error).message });
    } finally {
      setIsAssociating(false);
    }
  }

  async function handleDisassociate(supplierId: number) {
    setFeedback(null);
    setRemovingSupplierId(supplierId);
    try {
      const response = await associationService.disassociate(productId, supplierId);
      setFeedback({ type: 'success', message: response.message });
      const refreshed = await associationService.getProductAssociations(productId);
      setData(refreshed);
    } catch (error) {
      setFeedback({ type: 'error', message: extractApiError(error).message });
    } finally {
      setRemovingSupplierId(null);
    }
  }

  const associatedIds = new Set(data?.associatedSuppliers.map((s) => s.id) ?? []);
  const productThumb = getImageUrl(data?.product.imageUrl);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Associação de Fornecedor a Produto
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Vincule ou remova fornecedores responsáveis pelo fornecimento deste produto.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/produtos')}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
      </div>

      {feedback && (
        <AlertBanner
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          Carregando detalhes do produto...
        </div>
      ) : loadError || !data ? (
        <AlertBanner type="error" message={loadError ?? 'Produto não encontrado.'} />
      ) : (
        <div className="space-y-6">
          {/* Detalhes do Produto (Somente Leitura) */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-base font-semibold text-slate-900">Detalhes do Produto</h2>

            <div className="mt-4 flex flex-col gap-6 md:flex-row">
              {productThumb ? (
                <img
                  src={productThumb}
                  alt={data.product.name}
                  className="h-32 w-32 shrink-0 rounded-2xl border border-slate-200 object-cover shadow-2xs"
                />
              ) : (
                <div className="flex h-32 w-32 shrink-0 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400">
                  <Package className="h-8 w-8" />
                  <span className="mt-1 text-[11px]">Sem imagem</span>
                </div>
              )}

              <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Nome do Produto
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={data.product.name}
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Código de Barras
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={data.product.barcode ?? 'Não informado'}
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-mono text-sm text-slate-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Descrição
                  </label>
                  <textarea
                    readOnly
                    rows={2}
                    value={data.product.description}
                    className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-800"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Associação de Fornecedor */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="text-base font-semibold text-slate-900">Associação de Fornecedor</h2>
            <p className="mt-1 text-sm text-slate-500">
              Escolha um fornecedor cadastrado para vincular a este produto.
            </p>

            {allSuppliers.length === 0 ? (
              <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 sm:flex-row sm:items-center">
                <span>Nenhum fornecedor cadastrado ainda. Cadastre um fornecedor primeiro.</span>
                <Link
                  to="/fornecedores/novo"
                  className="shrink-0 rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
                >
                  Cadastrar Fornecedor
                </Link>
              </div>
            ) : (
              <form
                onSubmit={handleAssociate}
                className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
              >
                <div className="flex-1">
                  <label
                    htmlFor="supplierSelect"
                    className="text-sm font-medium text-slate-700"
                  >
                    Seleção de Fornecedor
                  </label>
                  <select
                    id="supplierSelect"
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">Selecione um fornecedor</option>
                    {allSuppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.companyName} — {supplier.cnpj}
                        {associatedIds.has(supplier.id) ? ' (Já associado)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isAssociating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  <Link2 className="h-4 w-4" />
                  {isAssociating ? 'Associando...' : 'Associar Fornecedor'}
                </button>
              </form>
            )}
          </section>

          {/* Fornecedores Associados */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-900">Fornecedores Associados</h2>
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                {data.associatedSuppliers.length} fornecedor(es)
              </span>
            </div>

            {data.associatedSuppliers.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-10 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Building2 className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-700">
                  Nenhum fornecedor associado a este produto.
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Selecione um fornecedor acima e clique em &quot;Associar Fornecedor&quot;.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    <tr>
                      <th className="px-6 py-3.5">Nome do Fornecedor</th>
                      <th className="px-6 py-3.5">CNPJ</th>
                      <th className="px-6 py-3.5 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.associatedSuppliers.map((supplier) => (
                      <tr key={supplier.id} className="transition hover:bg-slate-50/70">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">{supplier.companyName}</p>
                          <p className="text-xs text-slate-500">
                            Contato: {supplier.mainContact} • {supplier.phone}
                          </p>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-700">
                          {supplier.cnpj}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            disabled={removingSupplierId === supplier.id}
                            onClick={() => handleDisassociate(supplier.id)}
                            title="Desassociar Fornecedor"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                          >
                            <Unlink className="h-3.5 w-3.5" />
                            {removingSupplierId === supplier.id ? 'Removendo...' : 'Desassociar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

