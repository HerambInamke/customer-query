export const Card = ({
  children,
  title,
  headerActions,
  footer,
  className = '',
  bodyClassName = '',
  ...props
}) => {
  const hasHeader = title || headerActions;

  return (
    <div className={`card ${className}`} {...props}>
      {hasHeader && (
        <div className="card-header">
          {title && <h3 className="section-title" style={{ marginBottom: 0 }}>{title}</h3>}
          {headerActions && <div className="card-header-actions">{headerActions}</div>}
        </div>
      )}
      <div className={`card-body ${bodyClassName}`}>{children}</div>
      {footer && <div className="card-footer">{footer}</div>}
    </div>
  );
};

export default Card;
