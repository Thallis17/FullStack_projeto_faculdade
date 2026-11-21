import { ArrowRight, Boxes, Building2, Link2, Package, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertBanner } from '../../../shared/components/AlertBanner';
import { extractApiError } from '../../../shared/services/api';
import { associationService } from '../services/associationService';
import { DashboardSummary } from '../types/association.types';

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    associationService
      .getDashboard()
      .then((data) => {
        if (active) setSummary(data);
      })
      .catch((err) => {
        if (active) setError(extractApiError(err).message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const cards = [
    {
      label: 'Produtos Cadastrados',
      value: summary?.metrics.totalProducts ?? 0,
      icon: Package,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'Unidades em Estoque',
      value: summary?.metrics.totalStockUnits ?? 0,
      icon: Boxes,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Fornecedores Ativos',
      value: summary?.metrics.totalSuppliers ?? 0,
      icon: Building2,
      color: 'bg-sky-50 text-sky-600',
    },
    {
      label: 'Associações Criadas',
      value: summary?.metrics.totalAssociations ?? 0,
      icon: Link2,
      color: 'bg-violet-50 text-violet-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Visão Geral</h1>
          <p className="mt-1 text-sm text-slate-500">
            Acompanhe o resumo do estoque, fornecedores e vínculos cadastrados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/fornecedores/novo"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            Novo Fornecedor
          </Link>
          <Link
            to="/produtos/novo"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Novo Produto
          </Link>
        </div>
      </div>

      {error && <AlertBanner type="error" message={error} />}

      {/* Métricas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  {card.label}
                </span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
                {loading ? '—' : card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Listas Recentes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Produtos Recentes</h2>
            <Link
              to="/produtos"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Ver todos
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              <p className="p-6 text-center text-sm text-slate-500">Carregando...</p>
            ) : !summary || summary.recentProducts.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-500">
                Nenhum produto cadastrado ainda.
              </p>
            ) : (
              summary.recentProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-3 px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">
                      {product.category} • {product.stockQuantity} un. em estoque
                    </p>
                  </div>
                  <Link
                    to={`/produtos/${product.id}/fornecedores`}
                    className="shrink-0 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                  >
                    Associar
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Fornecedores Recentes</h2>
            <Link
              to="/fornecedores"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Ver todos
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {loading ? (
              <p className="p-6 text-center text-sm text-slate-500">Carregando...</p>
            ) : !summary || summary.recentSuppliers.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-500">
                Nenhum fornecedor cadastrado ainda.
              </p>
            ) : (
              summary.recentSuppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  className="flex items-center justify-between gap-3 px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {supplier.companyName}
                    </p>
                    <p className="font-mono text-xs text-slate-500">{supplier.cnpj}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {supplier._count?.products ?? 0} produto(s)
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

