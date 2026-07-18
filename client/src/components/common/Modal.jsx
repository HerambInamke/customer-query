import { useEffect, useRef } from 'react';
import { MdClose } from 'react-icons/md';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        ref={modalRef}
        className={`modal-content ${className}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div 
          className="card-header"
          style={{
            padding: 'var(--space-md) var(--space-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border)'
          }}
        >
          {title && (
            <h3 id="modal-title" className="section-title" style={{ marginBottom: 0 }}>
              {title}
            </h3>
          )}
          <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-secondary btn-sm"
            style={{ 
              padding: '0.25rem', 
              width: '1.75rem', 
              height: '1.75rem', 
              borderRadius: 'var(--radius-full)', 
              minWidth: 'auto' 
            }}
            aria-label="Close modal"
          >
            <MdClose style={{ fontSize: '1.1rem' }} />
          </button>
        </div>
        <div className="card-body" style={{ padding: 'var(--space-lg)' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
