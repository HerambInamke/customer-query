import Modal from './Modal.jsx';
import Button from './Button.jsx';

export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <p className="text-secondary">{message}</p>
        <div 
          className="form-actions"
          style={{
            marginTop: 'var(--space-md)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--space-sm)'
          }}
        >
          <Button 
            variant="secondary" 
            onClick={onClose} 
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button 
            variant={confirmVariant} 
            onClick={onConfirm} 
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;
