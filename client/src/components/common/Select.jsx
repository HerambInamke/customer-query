import { forwardRef } from 'react';

export const Select = forwardRef(({
  label,
  error,
  options = [],
  children,
  className = '',
  id,
  required,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`select ${error ? 'input-error' : ''}`}
        style={error ? { borderColor: 'var(--danger)' } : {}}
        {...props}
      >
        {children ? children : (
          options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))
        )}
      </select>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
