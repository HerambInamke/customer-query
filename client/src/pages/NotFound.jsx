import { Link } from 'react-router-dom';
import { MdOutlineHighlightOff } from 'react-icons/md';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';

export const NotFound = () => {
  return (
    <div 
      style={{ 
        minHeight: '80vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: 'var(--space-lg)',
        backgroundColor: 'var(--bg-app)'
      }}
    >
      <Card 
        style={{ 
          maxWidth: '480px', 
          width: '100%', 
          textAlign: 'center', 
          padding: 'var(--space-2xl) var(--space-xl)' 
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-md)' }}>
          <MdOutlineHighlightOff 
            style={{ 
              fontSize: '4.5rem', 
              color: 'var(--danger)', 
              opacity: 0.8
            }} 
          />
          
          <h1 
            style={{ 
              fontSize: '3rem', 
              fontWeight: 800, 
              color: 'var(--text)', 
              lineHeight: 1,
              letterSpacing: '-0.025em',
              margin: 'var(--space-xs) 0'
            }}
          >
            404
          </h1>
          
          <h2 className="section-title" style={{ fontSize: '1.5rem', marginBottom: 0 }}>
            Page Not Found
          </h2>
          
          <p className="text-secondary" style={{ fontSize: '0.95rem', marginBottom: 'var(--space-md)' }}>
            The page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
          </p>

          <Link to="/dashboard" style={{ width: '100%' }}>
            <Button variant="primary" style={{ width: '100%' }}>
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default NotFound;
