import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const baseField =
  "w-full rounded-xl border border-[#E8DCD0] bg-[#FFFCF7] px-3.5 py-2.5 text-sm text-[#3B2924] shadow-sm placeholder:text-[#806E66]/60 focus:border-[#B85C4A] focus:outline-none focus:ring-2 focus:ring-[#B85C4A]/20 disabled:cursor-not-allowed disabled:bg-[#F5EDE4] disabled:text-[#806E66] dark:border-[#493A34] dark:bg-[#2A211E] dark:text-[#FFF4E8] dark:placeholder:text-[#C7B8AE]/60 dark:focus:border-[#D47763] dark:focus:ring-[#D47763]/20 dark:disabled:bg-[#1F1816]";

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
      <label htmlFor={id} className="block text-sm font-medium text-[#3B2924] dark:text-[#FFF4E8]">
        {label}
      </label>
    )}
    {children}
    {error ? (
      <p role="alert" className="text-xs font-medium text-[#914536] dark:text-[#E28A76]">
        {error}
      </p>
    ) : hint ? (
      <p className="text-xs text-[#806E66] dark:text-[#C7B8AE]">{hint}</p>
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
