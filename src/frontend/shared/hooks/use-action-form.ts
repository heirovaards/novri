'use client';

import { useState } from 'react';
import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import type { ActionResult, RuleViolation } from '@shared/types/action-result.type';

type UseActionFormOptions<TValues extends FieldValues, TData> = {
  form: UseFormReturn<TValues>;
  action: (input: unknown) => Promise<ActionResult<TData>>;
  onSuccess?: (data: TData) => void;
  successMessage?: string;
};

export function useActionForm<TValues extends FieldValues, TData>({ form, action, onSuccess, successMessage }: UseActionFormOptions<TValues, TData>) {
  const [violations, setViolations] = useState<RuleViolation[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onValid(values: TValues) {
    setIsSubmitting(true);
    try {
      const result = await action(values);
      if (result.ok) {
        setViolations(result.violations ?? []);
        setErrorMessage(null);
        toast.success(successMessage ?? 'Tersimpan.');
        onSuccess?.(result.data);
        return;
      }

      if (result.fieldErrors) {
        for (const [field, message] of Object.entries(result.fieldErrors)) {
          form.setError(field as Path<TValues>, { message });
        }
      }
      setViolations(result.violations ?? []);
      setErrorMessage(result.message);
      toast.error(result.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return { submit: form.handleSubmit(onValid), isSubmitting, violations, errorMessage };
}
