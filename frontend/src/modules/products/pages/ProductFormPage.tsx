import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertBanner } from '../../../shared/components/AlertBanner';
import { extractApiError } from '../../../shared/services/api';
import { ProductForm } from '../components/ProductForm';
import { productService } from '../services/productService';
import { PREDEFINED_CATEGORIES, ProductFormValues } from '../types/product.types';

export function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [initialValues, setInitialValues] = useState<ProductFormValues | undefined>(undefined);
  const [loading, setLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let active = true;
    setLoading(true);
    productService
      .findById(Number(id))
      .then((product) => {
        if (!active) return;

        const isPredefined = PREDEFINED_CATEGORIES.some(
          (cat) => cat !== 'Outro' && cat === product.category
        );

        setInitialValues({
          name: product.name,
          barcode: product.barcode ?? '',
          description: product.description,
          stockQuantity: String(product.stockQuantity),
          category: isPredefined ? product.category : 'Outro',
          customCategory: isPredefined ? '' : product.category,
          expirationDate: product.expirationDate ?? '',
          imageFile: null,
          existingImageUrl: product.imageUrl,
          removeImage: false,
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
            {isEditing ? 'Editar Produto' : 'Cadastro de Produto'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isEditing
              ? 'Atualize as informações e o estoque do produto.'
              : 'Preencha os dados abaixo para adicionar um novo produto ao estoque.'}
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

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        {loading ? (
          <p className="py-8 text-center text-sm text-slate-500">Carregando dados do produto...</p>
        ) : loadError ? (
          <AlertBanner type="error" message={loadError} />
        ) : (
          <ProductForm
            initialValues={initialValues}
            submitLabel={isEditing ? 'Salvar Alterações' : 'Cadastrar'}
            resetOnSuccess={!isEditing}
            onSubmit={async (values) => {
              if (isEditing && id) {
                return productService.update(Number(id), values);
              }
              return productService.create(values);
            }}
          />
        )}
      </div>
    </div>
  );
}

