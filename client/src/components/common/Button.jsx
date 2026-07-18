import Loader from './Loader.jsx';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`btn btn-${variant} btn-${size} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader size="sm" />
      ) : (
        <>
          {icon && <span className="btn-icon-wrapper">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
