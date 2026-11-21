import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertBanner } from '../../../shared/components/AlertBanner';
import { extractApiError } from '../../../shared/services/api';
import { SupplierForm } from '../components/SupplierForm';
import { supplierService } from '../services/supplierService';
import { SupplierFormValues } from '../types/supplier.types';

export function SupplierFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [initialValues, setInitialValues] = useState<SupplierFormValues | undefined>(undefined);
  const [loading, setLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let active = true;
    setLoading(true);
    supplierService
      .findById(Number(id))
      .then((supplier) => {
        if (!active) return;
        setInitialValues({
          companyName: supplier.companyName,
          cnpj: supplier.cnpj,
          address: supplier.address,
          phone: supplier.phone,
          email: supplier.email,
          mainContact: supplier.mainContact,
        });
      })
      .catch((error) => {
        if (!active) return;
        setLoadError(extractApiError(error).message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isEditing ? 'Editar Fornecedor' : 'Cadastro de Fornecedor'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isEditing
              ? 'Atualize os dados do fornecedor cadastrado no sistema.'
              : 'Preencha as informações abaixo para cadastrar um novo fornecedor.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/fornecedores')}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        {loading ? (
          <p className="py-8 text-center text-sm text-slate-500">Carregando dados do fornecedor...</p>
        ) : loadError ? (
          <AlertBanner type="error" message={loadError} />
        ) : (
          <SupplierForm
            initialValues={initialValues}
            submitLabel={isEditing ? 'Salvar Alterações' : 'Cadastrar'}
            resetOnSuccess={!isEditing}
            onSubmit={async (values) => {
              if (isEditing && id) {
                return supplierService.update(Number(id), values);
              }
              return supplierService.create(values);
            }}
          />
        )}
      </div>
    </div>
  );
}

