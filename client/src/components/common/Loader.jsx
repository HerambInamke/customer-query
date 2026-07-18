export const Loader = ({ size = 'md', className = '' }) => {
  const sizeClass = size === 'lg' ? 'loader-lg' : size === 'sm' ? 'loader-sm' : '';

  const inlineStyle = size === 'sm' ? { width: '16px', height: '16px', borderWidth: '2px' } : {};

  return (
    <div className={`loader-container ${className}`}>
      <div 
        className={`loader ${sizeClass}`} 
        style={inlineStyle} 
        role="status"
        aria-label="loading"
      />
    </div>
  );
};

export default Loader;
