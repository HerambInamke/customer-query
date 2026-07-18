export const StatusBadge = ({ status, className = '' }) => {
  if (!status) return null;

  // Normalize status text for class selector matching
  const normalized = status.toLowerCase().replace(/\s+/g, '');
  let badgeClass = 'status-open';

  if (normalized === 'inprogress') {
    badgeClass = 'status-progress';
  } else if (normalized === 'resolved') {
    badgeClass = 'status-resolved';
  } else if (normalized === 'closed') {
    badgeClass = 'status-closed';
  } else if (normalized === 'rejected') {
    badgeClass = 'status-rejected';
  }

  return (
    <span className={`badge ${badgeClass} ${className}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
