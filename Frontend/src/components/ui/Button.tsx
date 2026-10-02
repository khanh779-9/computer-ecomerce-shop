import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '../../lib/utils';

export type ButtonVariant = 'solid' | 'primary' | 'outline' | 'orange-outline' | 'dark' | 'light' | 'quiet';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({
  children,
  variant = 'solid',
  className = '',
  ...rest
}: PropsWithChildren<ButtonProps>) {
  const variantStyles: Record<ButtonVariant, string> = {
    solid: 'bg-[#c2410c] text-white hover:bg-[#9a3412] border border-transparent shadow-sm',
    primary: 'bg-[#c2410c] text-white hover:bg-[#9a3412] border border-transparent shadow-sm',
    outline: 'bg-white text-stone-700 border border-stone-300 hover:border-stone-400 hover:bg-stone-50',
    'orange-outline': 'bg-white text-[#c2410c] border border-[#c2410c] hover:bg-orange-50',
    dark: 'bg-stone-900 text-white hover:bg-stone-800 border border-transparent',
    light: 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200',
    quiet: 'bg-transparent text-stone-600 hover:bg-stone-100 border border-transparent',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 select-none cursor-pointer',
        variantStyles[variant] || variantStyles.solid,
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
