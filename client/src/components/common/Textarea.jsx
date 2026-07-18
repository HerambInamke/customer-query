import { forwardRef } from 'react';

export const Textarea = forwardRef(({
  label,
  error,
  className = '',
  id,
  required,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="form-label">
          {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        className={`textarea ${error ? 'input-error' : ''}`}
        style={error ? { borderColor: 'var(--danger)' } : {}}
        {...props}
      />
      {error && <span className="form-error">{error}</span>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
