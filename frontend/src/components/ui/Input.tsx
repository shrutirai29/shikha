import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const baseField =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-900";

interface FieldWrapperProps {
  label?: string;
  error?: string;
  hint?: string;
  id: string;
  children: React.ReactNode;
}

const FieldWrapper = ({ label, error, hint, id, children }: FieldWrapperProps) => (
  <div className="space-y-1.5">
    {label && (
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
    )}
    {children}
    {error ? (
      <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">
        {error}
      </p>
    ) : hint ? (
      <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
    ) : null}
  </div>
);

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const fieldId = id ?? props.name;

    return (
      <FieldWrapper label={label} error={error} hint={hint} id={fieldId ?? ""}>
        <input
          ref={ref}
          id={fieldId}
          aria-invalid={Boolean(error)}
          className={cn(
            baseField,
            error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
            className
          )}
          {...props}
        />
      </FieldWrapper>
    );
  }
);

Input.displayName = "Input";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const fieldId = id ?? props.name;

    return (
      <FieldWrapper label={label} error={error} hint={hint} id={fieldId ?? ""}>
        <textarea
          ref={ref}
          id={fieldId}
          aria-invalid={Boolean(error)}
          className={cn(baseField, "min-h-24 resize-y", error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20", className)}
          {...props}
        />
      </FieldWrapper>
    );
  }
);

Textarea.displayName = "Textarea";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const fieldId = id ?? props.name;

    return (
      <FieldWrapper label={label} error={error} id={fieldId ?? ""}>
        <select
          ref={ref}
          id={fieldId}
          aria-invalid={Boolean(error)}
          className={cn(baseField, "pr-8", error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20", className)}
          {...props}
        >
          {children}
        </select>
      </FieldWrapper>
    );
  }
);

Select.displayName = "Select";
