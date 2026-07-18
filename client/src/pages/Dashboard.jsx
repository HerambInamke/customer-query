import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MdAdd, MdList, MdOutlineHourglassEmpty, MdError } from 'react-icons/md';
import queryService from '../services/queryService.js';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import PriorityBadge from '../components/common/PriorityBadge.jsx';
import { formatDate, truncateText, getErrorMessage } from '../utils/helpers.js';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentQueries, setRecentQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      // Fetch statistics and recent queries in parallel
      const [statsRes, queriesRes] = await Promise.all([
        queryService.getStats(),
        queryService.getAllQueries({ limit: 5, sort: 'newest' }),
      ]);

      if (statsRes.success) {
        setStats(statsRes.data.stats);
      }
      
      if (queriesRes.success) {
        setRecentQueries(queriesRes.data.queries);
      }
    } catch (err) {
      setError(getErrorMessage(err));
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDashboardData(false);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-2xl) 0' }}>
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <Card style={{ borderColor: 'var(--danger)', textAlign: 'center', padding: 'var(--space-xl)' }}>
          <MdError style={{ fontSize: '3rem', color: 'var(--danger)', marginBottom: 'var(--space-sm)' }} />
          <h3 className="section-title">Failed to Load Dashboard</h3>
          <p className="text-secondary" style={{ marginBottom: 'var(--space-md)' }}>{error}</p>
          <Button variant="secondary" onClick={() => fetchDashboardData(true)}>Retry Load</Button>
        </Card>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Queries', value: stats?.total || 0 },
    { title: 'Open', value: stats?.byStatus?.open || 0 },
    { title: 'In Progress', value: stats?.byStatus?.inProgress || 0 },
    { title: 'Resolved', value: stats?.byStatus?.resolved || 0 },
    { title: 'Closed', value: stats?.byStatus?.closed || 0 },
  ];

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-secondary">Track and manage customer support requests.</p>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {statCards.map((card) => (
          <Card key={card.title} className="dashboard-card">
            <span className="dashboard-card-title">{card.title}</span>
            <span className="dashboard-card-value">
              {card.value}
            </span>
          </Card>
        ))}
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-lg)', marginTop: 'var(--space-lg)' }}>
        {/* Quick Actions Card */}
        <section aria-labelledby="quick-actions-title">
          <Card id="quick-actions-title" title="Quick Actions">
            <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
              <Link to="/queries/create">
                <Button variant="primary" icon={<MdAdd style={{ fontSize: '1.2rem' }} />}>
                  Create New Query
                </Button>
              </Link>
              <Link to="/queries">
                <Button variant="secondary" icon={<MdList style={{ fontSize: '1.2rem' }} />}>
                  View All Queries
                </Button>
              </Link>
            </div>
          </Card>
        </section>

        {/* Recent Queries Table Card */}
        <section aria-labelledby="recent-queries-title">
          <Card 
            id="recent-queries-title"
            title="Recent Queries" 
            headerActions={
              <Link to="/queries" className="btn-link" style={{ fontSize: '0.875rem' }}>
                View All
              </Link>
            }
          >
            {recentQueries.length === 0 ? (
              <div className="empty-state">
                <MdOutlineHourglassEmpty className="empty-state-icon" />
                <h3 className="empty-state-title">No Queries Found</h3>
                <p className="empty-state-description">There are no customer queries logged in the system yet.</p>
                <Link to="/queries/create">
                  <Button variant="primary">Create Ticket</Button>
                </Link>
              </div>
            ) : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Subject</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentQueries.map((query) => (
                      <tr key={query._id}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{query.customerName}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{query.customerEmail}</div>
                        </td>
                        <td title={query.subject}>
                          <Link to={`/queries/${query._id}`} style={{ fontWeight: 500 }}>
                            {truncateText(query.subject, 35)}
                          </Link>
                        </td>
                        <td>{query.category}</td>
                        <td>
                          <PriorityBadge priority={query.priority} />
                        </td>
                        <td>
                          <StatusBadge status={query.status} />
                        </td>
                        <td>{formatDate(query.createdAt)}</td>
                        <td>
                          <Link to={`/queries/${query._id}`}>
                            <Button variant="secondary" size="sm">
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
