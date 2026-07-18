import { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  error,
  type = 'text',
  className = '',
  id,
  required,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        id={inputId}
        className={`input ${error ? 'input-error' : ''}`}
        style={error ? { borderColor: 'var(--danger)' } : {}}
        {...props}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
