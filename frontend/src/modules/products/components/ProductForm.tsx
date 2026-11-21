import { ImagePlus, Trash2 } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { AlertBanner } from '../../../shared/components/AlertBanner';
import { extractApiError, getImageUrl } from '../../../shared/services/api';
import { PREDEFINED_CATEGORIES, ProductFormValues } from '../types/product.types';

interface ProductFormProps {
  initialValues?: ProductFormValues;
  submitLabel: string;
  onSubmit: (values: ProductFormValues) => Promise<{ message: string }>;
  resetOnSuccess?: boolean;
}

const EMPTY_VALUES: ProductFormValues = {
  name: '',
  barcode: '',
  description: '',
  stockQuantity: '',
  category: '',
  customCategory: '',
  expirationDate: '',
  imageFile: null,
  existingImageUrl: null,
  removeImage: false,
};

function validateProduct(values: ProductFormValues): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values.name.trim()) {
    errors.name = 'O nome do produto é obrigatório.';
  } else if (values.name.trim().length < 2) {
    errors.name = 'O nome do produto deve ter pelo menos 2 caracteres.';
  }

  if (values.barcode.trim() && !/^\d+$/.test(values.barcode.trim())) {
    errors.barcode = 'O código de barras deve conter apenas números.';
  }

  if (!values.description.trim()) {
    errors.description = 'A descrição do produto é obrigatória.';
  } else if (values.description.trim().length < 3) {
    errors.description = 'A descrição deve ter pelo menos 3 caracteres.';
  }

  if (values.stockQuantity.trim() !== '') {
    if (!/^\d+$/.test(values.stockQuantity.trim())) {
      errors.stockQuantity =
        'A quantidade em estoque deve ser um número inteiro maior ou igual a zero.';
    }
  }

  if (!values.category.trim()) {
    errors.category = 'Selecione uma categoria.';
  } else if (values.category === 'Outro' && !values.customCategory.trim()) {
    errors.customCategory = 'Especifique a categoria do produto.';
  }

  if (values.imageFile && !values.imageFile.type.startsWith('image/')) {
    errors.image = 'Selecione um arquivo de imagem válido (JPG, PNG, WEBP ou GIF).';
  }

  return errors;
}

export function ProductForm({
  initialValues,
  submitLabel,
  onSubmit,
  resetOnSuccess = false,
}: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(initialValues ?? EMPTY_VALUES);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    getImageUrl(initialValues?.existingImageUrl)
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function clearFieldError(field: string) {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function handleTextChange(
    field: 'name' | 'barcode' | 'description' | 'stockQuantity' | 'category' | 'customCategory' | 'expirationDate',
    rawValue: string
  ) {
    setValues((prev) => ({
      ...prev,
      [field]: rawValue,
      ...(field === 'category' && rawValue !== 'Outro' ? { customCategory: '' } : {}),
    }));
    clearFieldError(field);
    if (field === 'category') {
      clearFieldError('customCategory');
    }
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setValues((prev) => ({
      ...prev,
      imageFile: file,
      removeImage: false,
    }));
    clearFieldError('image');
  }

  function handleRemoveImage() {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setValues((prev) => ({
      ...prev,
      imageFile: null,
      existingImageUrl: null,
      removeImage: true,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    clearFieldError('image');
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFeedback(null);

    const validationErrors = validateProduct(values);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setFeedback({
        type: 'error',
        message: 'Corrija os campos destacados antes de continuar.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await onSubmit(values);
      setFieldErrors({});
      setFeedback({ type: 'success', message: response.message });

      if (resetOnSuccess) {
        if (previewUrl && previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setValues(EMPTY_VALUES);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      const apiError = extractApiError(error);
      setFieldErrors(apiError.fieldErrors);
      setFeedback({ type: 'error', message: apiError.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputBaseClass =
    'mt-1.5 block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-2xs transition focus:outline-none focus:ring-2';

  function getFieldClass(field: string) {
    return fieldErrors[field]
      ? `${inputBaseClass} border-rose-400 focus:border-rose-500 focus:ring-rose-200`
      : `${inputBaseClass} border-slate-300 focus:border-indigo-500 focus:ring-indigo-100`;
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {feedback && (
        <AlertBanner
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Nome do Produto */}
        <div className="md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="name" className="text-sm font-medium text-slate-700">
              Nome do Produto <span className="text-rose-600">*</span>
            </label>
            {fieldErrors.name && (
              <span className="text-xs font-medium text-rose-600">{fieldErrors.name}</span>
            )}
          </div>
          <input
            id="name"
            name="name"
            type="text"
            value={values.name}
            onChange={(e) => handleTextChange('name', e.target.value)}
            placeholder="Insira o nome do produto"
            className={getFieldClass('name')}
          />
        </div>

        {/* Código de Barras */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="barcode" className="text-sm font-medium text-slate-700">
              Código de Barras
            </label>
            {fieldErrors.barcode && (
              <span className="text-xs font-medium text-rose-600">{fieldErrors.barcode}</span>
            )}
          </div>
          <input
            id="barcode"
            name="barcode"
            type="text"
            inputMode="numeric"
            value={values.barcode}
            onChange={(e) => handleTextChange('barcode', e.target.value)}
            placeholder="Insira o código de barras"
            className={getFieldClass('barcode')}
          />
        </div>

        {/* Quantidade em Estoque */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="stockQuantity" className="text-sm font-medium text-slate-700">
              Quantidade em Estoque
            </label>
            {fieldErrors.stockQuantity && (
              <span className="text-xs font-medium text-rose-600">
                {fieldErrors.stockQuantity}
              </span>
            )}
          </div>
          <input
            id="stockQuantity"
            name="stockQuantity"
            type="text"
            inputMode="numeric"
            value={values.stockQuantity}
            onChange={(e) => handleTextChange('stockQuantity', e.target.value)}
            placeholder="Quantidade disponível"
            className={getFieldClass('stockQuantity')}
          />
        </div>

        {/* Categoria */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="category" className="text-sm font-medium text-slate-700">
              Categoria <span className="text-rose-600">*</span>
            </label>
            {fieldErrors.category && (
              <span className="text-xs font-medium text-rose-600">{fieldErrors.category}</span>
            )}
          </div>
          <select
            id="category"
            name="category"
            value={values.category}
            onChange={(e) => handleTextChange('category', e.target.value)}
            className={getFieldClass('category')}
          >
            <option value="">Selecione uma categoria</option>
            {PREDEFINED_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Data de Validade */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="expirationDate" className="text-sm font-medium text-slate-700">
              Data de Validade <span className="text-xs font-normal text-slate-400">(se aplicável)</span>
            </label>
            {fieldErrors.expirationDate && (
              <span className="text-xs font-medium text-rose-600">
                {fieldErrors.expirationDate}
              </span>
            )}
          </div>
          <input
            id="expirationDate"
            name="expirationDate"
            type="date"
            value={values.expirationDate}
            onChange={(e) => handleTextChange('expirationDate', e.target.value)}
            placeholder="Selecione a data de validade"
            className={getFieldClass('expirationDate')}
          />
        </div>

        {/* Campo dinâmico quando Categoria = Outro */}
        {values.category === 'Outro' && (
          <div className="md:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="customCategory" className="text-sm font-medium text-slate-700">
                Especifique a Categoria <span className="text-rose-600">*</span>
              </label>
              {fieldErrors.customCategory && (
                <span className="text-xs font-medium text-rose-600">
                  {fieldErrors.customCategory}
                </span>
              )}
            </div>
            <input
              id="customCategory"
              name="customCategory"
              type="text"
              value={values.customCategory}
              onChange={(e) => handleTextChange('customCategory', e.target.value)}
              placeholder="Digite o nome da categoria"
              className={getFieldClass('customCategory')}
            />
          </div>
        )}

        {/* Descrição */}
        <div className="md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="description" className="text-sm font-medium text-slate-700">
              Descrição <span className="text-rose-600">*</span>
            </label>
            {fieldErrors.description && (
              <span className="text-xs font-medium text-rose-600">{fieldErrors.description}</span>
            )}
          </div>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={values.description}
            onChange={(e) => handleTextChange('description', e.target.value)}
            placeholder="Descreva brevemente o produto"
            className={getFieldClass('description')}
          />
        </div>

        {/* Imagem do Produto */}
        <div className="md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="image" className="text-sm font-medium text-slate-700">
              Imagem do Produto <span className="text-xs font-normal text-slate-400">(se aplicável)</span>
            </label>
            {fieldErrors.image && (
              <span className="text-xs font-medium text-rose-600">{fieldErrors.image}</span>
            )}
          </div>

          <div className="mt-1.5 flex flex-col gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-4 sm:flex-row sm:items-center">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Pré-visualização do produto"
                className="h-24 w-24 rounded-xl border border-slate-200 object-cover shadow-2xs"
              />
            ) : (
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400">
                <ImagePlus className="h-7 w-7" />
              </div>
            )}

            <div className="flex-1 space-y-2">
              <p className="text-xs text-slate-500">
                Carregue uma imagem representativa do produto (JPG, PNG, WEBP ou GIF até 5MB).
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                <input
                  ref={fileInputRef}
                  id="image"
                  name="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageChange}
                  className="block w-full max-w-xs text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {previewUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remover imagem
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60"
        >
          {isSubmitting ? 'Salvando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

