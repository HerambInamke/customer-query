import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  MdArrowBack,
  MdEdit,
  MdDelete,
  MdPerson,
  MdMail,
  MdPhone,
  MdHistory,
} from 'react-icons/md';
import queryService from '../services/queryService.js';
import userService from '../services/userService.js';
import useAuth from '../hooks/useAuth.js';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import PriorityBadge from '../components/common/PriorityBadge.jsx';
import ConfirmationDialog from '../components/common/ConfirmationDialog.jsx';
import { TICKET_STATUS, TICKET_PRIORITY, USER_ROLES } from '../constants/index.js';
import { formatDate, getErrorMessage } from '../utils/helpers.js';

export const ViewQuery = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [query, setQuery] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPriority, setUpdatingPriority] = useState(false);
  const [updatingAssignee, setUpdatingAssignee] = useState(false);

  const fetchQueryAndAgents = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      const queryRes = await queryService.getQueryById(id);
      if (queryRes.success) {
        setQuery(queryRes.data.query);
      }

      // If user is staff, fetch support agents for assignment options
      const isStaff = user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.SUPPORT;
      if (isStaff) {
        const agentsRes = await userService.getSupportAgents();
        if (agentsRes.success) {
          setAgents(agentsRes.data.agents || []);
        }
      }
    } catch (err) {
      setError(getErrorMessage(err));
      toast.error('Failed to load query details.');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQueryAndAgents(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchQueryAndAgents]);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    if (!newStatus || newStatus === query.status) return;
    
    setUpdatingStatus(true);
    try {
      const response = await queryService.updateStatus(id, newStatus);
      if (response.success) {
        setQuery(response.data.query);
        toast.success(`Status updated to ${newStatus}`);
      }
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (e) => {
    const newPriority = e.target.value;
    if (!newPriority || newPriority === query.priority) return;

    setUpdatingPriority(true);
    try {
      const response = await queryService.updatePriority(id, newPriority);
      if (response.success) {
        setQuery(response.data.query);
        toast.success(`Priority updated to ${newPriority}`);
      }
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Failed to update priority.');
    } finally {
      setUpdatingPriority(false);
    }
  };

  const handleAssigneeChange = async (e) => {
    const newAssigneeId = e.target.value;
    if (newAssigneeId === (query.assignedTo?._id || '')) return;

    setUpdatingAssignee(true);
    try {
      const response = await queryService.assignAgent(id, newAssigneeId || null);
      if (response.success) {
        setQuery(response.data.query);
        toast.success('Assignee updated successfully.');
      }
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Failed to assign agent.');
    } finally {
      setUpdatingAssignee(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await queryService.deleteQuery(id);
      if (response.success) {
        toast.success('Query deleted successfully.');
        navigate('/queries');
      }
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Failed to delete query.');
    } finally {
      setIsDeleteOpen(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-2xl) 0' }}>
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !query) {
    return (
      <div className="page-container">
        <Card style={{ borderColor: 'var(--danger)', textAlign: 'center', padding: 'var(--space-xl)' }}>
          <h3 className="section-title">Query Not Found</h3>
          <p className="text-secondary" style={{ marginBottom: 'var(--space-md)' }}>{error || 'This ticket could not be retrieved.'}</p>
          <Link to="/queries">
            <Button variant="secondary">Back to Queries</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isStaff = user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.SUPPORT;

  return (
    <div className="page-container">
      {/* Header */}
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <Link to="/queries" className="btn-link" style={{ display: 'flex', alignItems: 'center' }}>
            <MdArrowBack style={{ fontSize: '1.5rem' }} />
          </Link>
          <div>
            <h1 className="page-title">{query.subject}</h1>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-xs)', flexWrap: 'wrap' }}>
              <StatusBadge status={query.status} />
              <PriorityBadge priority={query.priority} />
              <span className="badge" style={{ backgroundColor: 'var(--secondary-light)', color: 'var(--text-secondary)' }}>
                {query.category}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <Link to={`/queries/${query._id}/edit`}>
            <Button variant="secondary" icon={<MdEdit />}>
              Edit
            </Button>
          </Link>
          {isStaff && (
            <Button variant="danger" icon={<MdDelete />} onClick={() => setIsDeleteOpen(true)}>
              Delete
            </Button>
          )}
        </div>
      </header>

      {/* Main Details Grid */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr', 
          gap: 'var(--space-lg)' 
        }}
        className="view-query-grid"
      >
        <style dangerouslySetInnerHTML={{ __html: `
          @media (min-width: 1024px) {
            .view-query-grid {
              grid-template-columns: 2fr 1fr !important;
            }
          }
        `}} />

        {/* Left Column: Description & Metadata */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {/* Query Description Card */}
          <Card title="Query Description">
            <div style={{ whiteSpace: 'pre-wrap', color: 'var(--text)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              {query.description}
            </div>

            {query.tags && query.tags.length > 0 && (
              <div style={{ marginTop: 'var(--space-lg)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-md)' }}>
                <span className="text-secondary" style={{ fontSize: '0.875rem', fontWeight: 600, marginRight: 'var(--space-sm)' }}>
                  Tags:
                </span>
                <div style={{ display: 'inline-flex', gap: 'var(--space-xs)', flexWrap: 'wrap' }}>
                  {query.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="badge" 
                      style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Activity/Timeline logs Card */}
          <Card title="Timeline Log" headerActions={<MdHistory style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }} />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', position: 'relative', paddingLeft: '1.5rem' }}>
              <div 
                style={{ 
                  position: 'absolute', 
                  left: '6px', 
                  top: '8px', 
                  bottom: '8px', 
                  width: '2px', 
                  backgroundColor: 'var(--border)' 
                }} 
              />

              {/* Event 1: Creation */}
              <div style={{ position: 'relative' }}>
                <div 
                  style={{ 
                    position: 'absolute', 
                    left: '-23px', 
                    top: '4px', 
                    width: '10px', 
                    height: '10px', 
                    borderRadius: 'var(--radius-full)', 
                    backgroundColor: 'var(--text)' 
                  }} 
                />
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Ticket Created</div>
                <div className="text-secondary" style={{ fontSize: '0.875rem' }}>
                  Submitted by {query.createdBy?.name || 'Customer'}
                </div>
                <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                  {formatDate(query.createdAt)}
                </div>
              </div>

              {/* Event 2: Assignment */}
              <div style={{ position: 'relative' }}>
                <div 
                  style={{ 
                    position: 'absolute', 
                    left: '-23px', 
                    top: '4px', 
                    width: '10px', 
                    height: '10px', 
                    borderRadius: 'var(--radius-full)', 
                    backgroundColor: query.assignedTo ? 'var(--text)' : 'var(--border)' 
                  }} 
                />
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Ticket Assignment</div>
                <div className="text-secondary" style={{ fontSize: '0.875rem' }}>
                  {query.assignedTo 
                    ? `Assigned to ${query.assignedTo.name}` 
                    : 'Currently unassigned and awaiting support response'
                  }
                </div>
              </div>

              {/* Event 3: Current Status */}
              <div style={{ position: 'relative' }}>
                <div 
                  style={{ 
                    position: 'absolute', 
                    left: '-23px', 
                    top: '4px', 
                    width: '10px', 
                    height: '10px', 
                    borderRadius: 'var(--radius-full)', 
                    backgroundColor: 'var(--text-secondary)' 
                  }} 
                />
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Latest Activity</div>
                <div className="text-secondary" style={{ fontSize: '0.875rem' }}>
                  Ticket state is in <strong>{query.status}</strong> mode
                </div>
                <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                  Last updated {formatDate(query.updatedAt)}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Customer Info & Inline Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {/* Customer Profile Card */}
          <Card title="Customer Profile">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <MdPerson style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Name</div>
                  <div style={{ fontWeight: 500, color: 'var(--text)' }}>{query.customerName}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <MdMail style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }} />
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Email</div>
                  <a href={`mailto:${query.customerEmail}`} style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                    {query.customerEmail}
                  </a>
                </div>
              </div>

              {query.customerPhone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <MdPhone style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Phone</div>
                    <a href={`tel:${query.customerPhone}`} style={{ fontWeight: 500, color: 'var(--text)', fontSize: '0.9rem' }}>
                      {query.customerPhone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Modifier Actions Card (visible if Staff) */}
          {isStaff && (
            <Card title="Ticket Resolution Actions">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                
                {/* Inline Status Modifier */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="inline-status-select">Status</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      id="inline-status-select"
                      className="select"
                      value={query.status}
                      onChange={handleStatusChange}
                      disabled={updatingStatus}
                    >
                      {Object.values(TICKET_STATUS).map((statusVal) => (
                        <option key={statusVal} value={statusVal}>
                          {statusVal}
                        </option>
                      ))}
                    </select>
                    {updatingStatus && (
                      <div style={{ position: 'absolute', right: '2rem', top: '50%', transform: 'translateY(-50%)' }}>
                        <Loader size="sm" style={{ padding: 0 }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline Priority Modifier */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="inline-priority-select">Priority</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      id="inline-priority-select"
                      className="select"
                      value={query.priority}
                      onChange={handlePriorityChange}
                      disabled={updatingPriority}
                    >
                      {Object.values(TICKET_PRIORITY).map((priVal) => (
                        <option key={priVal} value={priVal}>
                          {priVal}
                        </option>
                      ))}
                    </select>
                    {updatingPriority && (
                      <div style={{ position: 'absolute', right: '2rem', top: '50%', transform: 'translateY(-50%)' }}>
                        <Loader size="sm" style={{ padding: 0 }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline Assignee Modifier */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="inline-assignee-select">Assign To Agent</label>
                  <div style={{ position: 'relative' }}>
                    <select
                      id="inline-assignee-select"
                      className="select"
                      value={query.assignedTo?._id || ''}
                      onChange={handleAssigneeChange}
                      disabled={updatingAssignee}
                    >
                      <option value="">Unassigned</option>
                      {agents.map((agent) => (
                        <option key={agent._id} value={agent._id}>
                          {agent.name}
                        </option>
                      ))}
                    </select>
                    {updatingAssignee && (
                      <div style={{ position: 'absolute', right: '2rem', top: '50%', transform: 'translateY(-50%)' }}>
                        <Loader size="sm" style={{ padding: 0 }} />
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </Card>
          )}

          {/* Metadata Card */}
          <Card title="System Details">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-secondary">Created By</span>
                <span style={{ fontWeight: 500 }}>{query.createdBy?.name || 'System'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-secondary">Created At</span>
                <span>{formatDate(query.createdAt)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="text-secondary">Last Updated</span>
                <span>{formatDate(query.updatedAt)}</span>
              </div>
              {query.updatedBy && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-secondary">Updated By</span>
                  <span style={{ fontWeight: 500 }}>{query.updatedBy.name}</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Support Ticket"
        message="Are you sure you want to delete this customer support query? It will be soft-deleted and removed from the active lists."
        confirmText="Confirm Delete"
      />
    </div>
  );
};

export default ViewQuery;
