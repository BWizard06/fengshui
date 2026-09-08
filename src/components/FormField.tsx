import type { ReactNode } from 'react';

interface Props {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}

export const labelClass =
  'mb-1.5 block text-[0.625rem] font-medium tracking-[0.125rem] text-mute uppercase desk:mb-[7px] desk:text-[0.6875rem]';

export default function FormField({ id, label, error, children }: Props) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 text-[0.75rem] font-light text-caution"
        >
          {error}
        </p>
      )}
    </div>
  );
}
