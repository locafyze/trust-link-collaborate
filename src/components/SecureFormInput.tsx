
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sanitizeInput } from '@/lib/security';

interface SecureFormInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  validator?: (value: string) => boolean;
  errorMessage?: string;
  maxLength?: number;
  required?: boolean;
  placeholder?: string;
}

export const SecureFormInput: React.FC<SecureFormInputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  validator,
  errorMessage,
  maxLength = 255,
  required = false,
  placeholder,
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeInput(e.target.value);
    
    if (sanitizedValue.length > maxLength) {
      setError(`Maximum ${maxLength} characters allowed`);
      return;
    }

    if (validator && sanitizedValue && !validator(sanitizedValue)) {
      setError(errorMessage || 'Invalid input');
    } else {
      setError(null);
    }

    onChange(sanitizedValue);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label} {required && <span className="text-red-500">*</span>}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        className={error ? 'border-red-500' : ''}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};
