import React from 'react';
import { Check } from 'lucide-react';

const Checkbox = ({ 
  id, 
  checked = false, 
  onChange, 
  label, 
  disabled = false, 
  error,
  className = '' 
}) => {
  const handleChange = (e) => {
    onChange?.(e?.target?.checked);
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
        />
        <div
          onClick={() => !disabled && onChange?.(!checked)}
          className={`
            w-4 h-4 rounded border-2 cursor-pointer transition-all duration-200
            flex items-center justify-center
            ${checked
              ? 'bg-primary border-primary text-primary-foreground'
              : 'bg-background border-border hover:border-primary/50'
            }
            ${disabled 
              ? 'opacity-50 cursor-not-allowed' :'hover:shadow-sm'
            }
            ${error 
              ? 'border-error' :''
            }
          `}
        >
          {checked && (
            <Check size={12} className="text-white" strokeWidth={3} />
          )}
        </div>
      </div>
      {label && (
        <label
          htmlFor={id}
          className={`
            text-sm cursor-pointer select-none
            ${disabled 
              ? 'text-muted-foreground cursor-not-allowed' 
              : 'text-foreground hover:text-primary'
            }
            ${error 
              ? 'text-error' :''
            }
          `}
          onClick={() => !disabled && onChange?.(!checked)}
        >
          {label}
        </label>
      )}
      {error && (
        <span className="text-xs text-error mt-1">
          {error}
        </span>
      )}
    </div>
  );
};

export default Checkbox;