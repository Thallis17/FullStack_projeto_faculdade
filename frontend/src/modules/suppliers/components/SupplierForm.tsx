import { FormEvent, useState } from 'react';
import { AlertBanner } from '../../../shared/components/AlertBanner';
import { extractApiError } from '../../../shared/services/api';
import { maskCnpj, maskPhone, onlyDigits } from '../../../shared/utils/masks';
import { SupplierFormValues } from '../types/supplier.types';

interface SupplierFormProps {
  initialValues?: SupplierFormValues;
  submitLabel: string;
  onSubmit: (values: SupplierFormValues) => Promise<{ message: string }>;
  resetOnSuccess?: boolean;
}

const EMPTY_VALUES: SupplierFormValues = {
  companyName: '',
  cnpj: '',
  address: '',
  phone: '',
  email: '',
  mainContact: '',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateSupplier(values: SupplierFormValues): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values.companyName.trim()) {
    errors.companyName = 'O nome da empresa é obrigatório.';
  } else if (values.companyName.trim().length < 2) {
    errors.companyName = 'O nome da empresa deve ter pelo menos 2 caracteres.';
  }

  const cnpjDigits = onlyDigits(values.cnpj);
  if (!cnpjDigits) {
    errors.cnpj = 'O CNPJ é obrigatório.';
  } else if (cnpjDigits.length !== 14) {
    errors.cnpj = 'Informe um CNPJ válido no formato 00.000.000/0000-00.';
  }

  if (!values.address.trim()) {
    errors.address = 'O endereço é obrigatório.';
  } else if (values.address.trim().length < 5) {
    errors.address = 'Informe o endereço completo da empresa.';
  }

  const phoneDigits = onlyDigits(values.phone);
  if (!phoneDigits) {
    errors.phone = 'O telefone é obrigatório.';
  } else if (phoneDigits.length !== 10 && phoneDigits.length !== 11) {
    errors.phone = 'Informe um telefone válido com DDD, ex.: (00) 0000-0000.';
  }

  if (!values.email.trim()) {
    errors.email = 'O e-mail é obrigatório.';
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Informe um endereço de e-mail válido.';
  }

  if (!values.mainContact.trim()) {
    errors.mainContact = 'O contato principal é obrigatório.';
  } else if (values.mainContact.trim().length < 2) {
    errors.mainContact = 'O nome do contato principal deve ter pelo menos 2 caracteres.';
  }

  return errors;
}

export function SupplierForm({
  initialValues,
  submitLabel,
  onSubmit,
  resetOnSuccess = false,
}: SupplierFormProps) {
  const [values, setValues] = useState<SupplierFormValues>(initialValues ?? EMPTY_VALUES);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(field: keyof SupplierFormValues, rawValue: string) {
    let nextValue = rawValue;
    if (field === 'cnpj') nextValue = maskCnpj(rawValue);
    if (field === 'phone') nextValue = maskPhone(rawValue);

    setValues((prev) => ({ ...prev, [field]: nextValue }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFeedback(null);

    const validationErrors = validateSupplier(values);
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
        setValues(EMPTY_VALUES);
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
        {/* Nome da Empresa */}
        <div className="md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="companyName" className="text-sm font-medium text-slate-700">
              Nome da Empresa <span className="text-rose-600">*</span>
            </label>
            {fieldErrors.companyName && (
              <span className="text-xs font-medium text-rose-600">{fieldErrors.companyName}</span>
            )}
          </div>
          <input
            id="companyName"
            name="companyName"
            type="text"
            value={values.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            placeholder="Insira o nome da empresa"
            className={getFieldClass('companyName')}
          />
        </div>

        {/* CNPJ */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="cnpj" className="text-sm font-medium text-slate-700">
              CNPJ <span className="text-rose-600">*</span>
            </label>
            {fieldErrors.cnpj && (
              <span className="text-xs font-medium text-rose-600">{fieldErrors.cnpj}</span>
            )}
          </div>
          <input
            id="cnpj"
            name="cnpj"
            type="text"
            inputMode="numeric"
            value={values.cnpj}
            onChange={(e) => handleChange('cnpj', e.target.value)}
            placeholder="00.000.000/0000-00"
            className={getFieldClass('cnpj')}
          />
        </div>

        {/* Telefone */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="phone" className="text-sm font-medium text-slate-700">
              Telefone <span className="text-rose-600">*</span>
            </label>
            {fieldErrors.phone && (
              <span className="text-xs font-medium text-rose-600">{fieldErrors.phone}</span>
            )}
          </div>
          <input
            id="phone"
            name="phone"
            type="text"
            inputMode="tel"
            value={values.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="(00) 0000-0000"
            className={getFieldClass('phone')}
          />
        </div>

        {/* E-mail */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              E-mail <span className="text-rose-600">*</span>
            </label>
            {fieldErrors.email && (
              <span className="text-xs font-medium text-rose-600">{fieldErrors.email}</span>
            )}
          </div>
          <input
            id="email"
            name="email"
            type="email"
            value={values.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="exemplo@fornecedor.com"
            className={getFieldClass('email')}
          />
        </div>

        {/* Contato Principal */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="mainContact" className="text-sm font-medium text-slate-700">
              Contato Principal <span className="text-rose-600">*</span>
            </label>
            {fieldErrors.mainContact && (
              <span className="text-xs font-medium text-rose-600">{fieldErrors.mainContact}</span>
            )}
          </div>
          <input
            id="mainContact"
            name="mainContact"
            type="text"
            value={values.mainContact}
            onChange={(e) => handleChange('mainContact', e.target.value)}
            placeholder="Nome do contato principal"
            className={getFieldClass('mainContact')}
          />
        </div>

        {/* Endereço */}
        <div className="md:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="address" className="text-sm font-medium text-slate-700">
              Endereço <span className="text-rose-600">*</span>
            </label>
            {fieldErrors.address && (
              <span className="text-xs font-medium text-rose-600">{fieldErrors.address}</span>
            )}
          </div>
          <textarea
            id="address"
            name="address"
            rows={3}
            value={values.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Insira o endereço completo da empresa"
            className={getFieldClass('address')}
          />
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

