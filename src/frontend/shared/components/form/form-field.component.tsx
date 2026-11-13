import { cloneElement, isValidElement } from 'react';
import { CircleX } from 'lucide-react';

export function FormField({
  id,
  label,
  required,
  help,
  error,
  endAdornment,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  help?: string;
  error?: string;
  endAdornment?: React.ReactNode;
  children: React.ReactNode;
}) {
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;

  const control = isValidElement(children) ? cloneElement(children, { id, 'aria-describedby': describedBy, 'aria-invalid': Boolean(error) } as object) : children;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-foreground">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </label>
      {endAdornment ? (
        <div className="relative">
          {control}
          {endAdornment}
        </div>
      ) : (
        control
      )}
      {help && !error ? (
        <p id={helpId} className="text-[13px] leading-[19px] text-muted-foreground">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="flex items-center gap-1 text-[13px] leading-[19px] text-destructive">
          <CircleX aria-hidden className="size-3.5" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
