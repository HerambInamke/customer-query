export const PriorityBadge = ({ priority, className = '' }) => {
  if (!priority) return null;

  const normalized = priority.toLowerCase();
  let badgeClass = 'priority-low';

  if (normalized === 'medium') {
    badgeClass = 'priority-medium';
  } else if (normalized === 'high') {
    badgeClass = 'priority-high';
  } else if (normalized === 'urgent') {
    badgeClass = 'priority-urgent';
  }

  return (
    <span className={`badge ${badgeClass} ${className}`}>
      {priority}
    </span>
  );
};

export default PriorityBadge;
