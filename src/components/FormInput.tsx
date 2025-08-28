import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';
import { BeamAnalysisFormData, fieldDescriptions, fieldUnits } from '@/lib/types';
import { Info } from 'lucide-react';

interface FormInputProps {
  name: keyof BeamAnalysisFormData;
  label: string;
  register: UseFormRegister<BeamAnalysisFormData>;
  error?: FieldError;
  placeholder?: string;
  step?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  name,
  label,
  register,
  error,
  placeholder,
  step = "0.01"
}) => {
  const unit = fieldUnits[name];
  const description = fieldDescriptions[name];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <div className="group relative">
          <Info className="h-4 w-4 text-gray-400 cursor-help" />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
            {description}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
      
      <div className="relative">
        <input
          id={name}
          type="number"
          step={step}
          placeholder={placeholder}
          {...register(name, { valueAsNumber: true })}
          style={{
            WebkitAppearance: 'none',
            MozAppearance: 'textfield',
          }}
          className={`
            block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-500
            ${error 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 dark:border-gray-600'
            }
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
          `}
        />
        {unit && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">{unit}</span>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error.message}</p>
      )}
    </div>
  );
};
