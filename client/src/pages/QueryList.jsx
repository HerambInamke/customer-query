import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  MdSearch,
  MdDelete,
  MdEdit,
  MdVisibility,
  MdOutlineSearchOff,
  MdOutlineFolderOpen,
  MdRefresh,
  MdArrowBack,
  MdArrowForward,
} from 'react-icons/md';
import queryService from '../services/queryService.js';
import useAuth from '../hooks/useAuth.js';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import PriorityBadge from '../components/common/PriorityBadge.jsx';
import ConfirmationDialog from '../components/common/ConfirmationDialog.jsx';
import { TICKET_STATUS, TICKET_PRIORITY, TICKET_CATEGORY, USER_ROLES } from '../constants/index.js';
import { formatDate, truncateText, getErrorMessage } from '../utils/helpers.js';

export const QueryList = () => {
  const { user } = useAuth();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);

  const [selectedIds, setSelectedIds] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);

  const fetchQueries = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit,
        sort,
      };

      if (search.trim()) params.search = search.trim();
      if (status) params.status = status;
      if (priority) params.priority = priority;
      if (category) params.category = category;

      const response = await queryService.getAllQueries(params);
      
      if (response.success) {
        setQueries(response.data.queries || []);
        if (response.meta) {
          setTotalPages(response.meta.totalPages || 1);
          setTotalDocs(response.meta.totalDocs || 0);
          
          if (response.meta.page > response.meta.totalPages && response.meta.totalPages > 0) {
            setPage(response.meta.totalPages);
          }
        }
      }
    } catch (err) {
      setError(getErrorMessage(err));
      toast.error('Failed to load customer queries.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, priority, category, sort]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQueries(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchQueries]);

  const handleFilterChange = (filterSetter, value) => {
    filterSetter(value);
    setPage(1);
    setSelectedIds([]);
  };

  const handleDeleteSingle = async () => {
    if (!deletingId) return;
    try {
      const response = await queryService.deleteQuery(deletingId);
      if (response.success) {
        toast.success('Query deleted successfully.');
        fetchQueries();
      }
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Delete failed.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setBulkDeleting(true);
    try {
      const response = await queryService.bulkDelete(selectedIds);
      if (response.success) {
        toast.success(`Successfully deleted ${selectedIds.length} queries.`);
        setSelectedIds([]);
        fetchQueries();
      }
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Bulk delete failed.');
    } finally {
      setBulkDeleting(false);
      setIsBulkConfirmOpen(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(queries.map((q) => q._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const isStaff = user?.role === USER_ROLES.ADMIN || user?.role === USER_ROLES.SUPPORT;

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">Customer Queries</h1>
          <p className="text-secondary">Manage, filter, and track customer support requests.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <Button variant="secondary" onClick={() => fetchQueries(true)} icon={<MdRefresh style={{ fontSize: '1.2rem' }} />}>
            Refresh
          </Button>
          <Link to="/queries/create">
            <Button variant="primary">New Query</Button>
          </Link>
        </div>
      </header>

      {/* Filter and Control Panel Card */}
      <section aria-labelledby="filter-section-title">
        <Card id="filter-section-title" className="card" style={{ marginBottom: 'var(--space-lg)' }}>
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
              gap: 'var(--space-sm)',
              alignItems: 'end'
            }}
          >
            {/* Search Input */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="search-input">Search Text</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="search-input"
                  type="text"
                  className="input"
                  placeholder="Subject, email..."
                  value={search}
                  onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                  style={{ paddingLeft: '2.25rem' }}
                />
                <MdSearch 
                  style={{ 
                    position: 'absolute', 
                    left: '0.75rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--text-secondary)',
                    fontSize: '1.2rem'
                  }} 
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="category-select">Category</label>
              <select
                id="category-select"
                className="select"
                value={category}
                onChange={(e) => handleFilterChange(setCategory, e.target.value)}
              >
                <option value="">All Categories</option>
                {Object.values(TICKET_CATEGORY).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="status-select">Status</label>
              <select
                id="status-select"
                className="select"
                value={status}
                onChange={(e) => handleFilterChange(setStatus, e.target.value)}
              >
                <option value="">All Statuses</option>
                {Object.values(TICKET_STATUS).map((stat) => (
                  <option key={stat} value={stat}>{stat}</option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="priority-select">Priority</label>
              <select
                id="priority-select"
                className="select"
                value={priority}
                onChange={(e) => handleFilterChange(setPriority, e.target.value)}
              >
                <option value="">All Priorities</option>
                {Object.values(TICKET_PRIORITY).map((pri) => (
                  <option key={pri} value={pri}>{pri}</option>
                ))}
              </select>
            </div>

            {/* Sort Control */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="sort-select">Sort By</label>
              <select
                id="sort-select"
                className="select"
                value={sort}
                onChange={(e) => handleFilterChange(setSort, e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
          </div>
        </Card>
      </section>

      {/* Main Queries List Render */}
      {loading ? (
        <div style={{ padding: 'var(--space-2xl) 0' }}>
          <Loader size="lg" />
        </div>
      ) : error ? (
        <Card style={{ borderColor: 'var(--danger)', textAlign: 'center', padding: 'var(--space-xl)' }}>
          <h3 className="section-title" style={{ color: 'var(--danger)' }}>Error Loading Queries</h3>
          <p className="text-secondary" style={{ marginBottom: 'var(--space-md)' }}>{error}</p>
          <Button variant="secondary" onClick={() => fetchQueries(true)}>Retry Load</Button>
        </Card>
      ) : queries.length === 0 ? (
        <Card style={{ padding: 'var(--space-2xl) 0', textAlign: 'center' }}>
          {search || status || priority || category ? (
            <div className="empty-state">
              <MdOutlineSearchOff className="empty-state-icon" />
              <h3 className="empty-state-title">No Search Results</h3>
              <p className="empty-state-description">Try adjusting your keyword filter searches or category selects.</p>
              <Button 
                variant="secondary" 
                onClick={() => {
                  setSearch('');
                  setStatus('');
                  setPriority('');
                  setCategory('');
                  setPage(1);
                }}
              >
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="empty-state">
              <MdOutlineFolderOpen className="empty-state-icon" />
              <h3 className="empty-state-title">No Tickets Logged</h3>
              <p className="empty-state-description">Start creating customer queries to populate the list.</p>
              <Link to="/queries/create">
                <Button variant="primary">Create Query</Button>
              </Link>
            </div>
          )}
        </Card>
      ) : (
        <section aria-labelledby="query-list-table-title">
          <Card id="query-list-table-title" title={`Showing ${totalDocs} Queries`}>
            {/* Bulk Actions Pane (visible if staff and rows selected) */}
            {isStaff && selectedIds.length > 0 && (
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--space-md)', 
                  backgroundColor: 'var(--bg-app)', 
                  padding: 'var(--space-sm) var(--space-md)', 
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: 'var(--space-md)',
                  border: '1px solid var(--border)'
                }}
              >
                <span className="text-secondary" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                  {selectedIds.length} row(s) selected
                </span>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => setIsBulkConfirmOpen(true)}
                  icon={<MdDelete style={{ fontSize: '1rem' }} />}
                >
                  Bulk Soft Delete
                </Button>
              </div>
            )}

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    {isStaff && (
                      <th style={{ width: '40px', paddingRight: 0 }}>
                        <input 
                          type="checkbox" 
                          onChange={handleSelectAll}
                          checked={selectedIds.length === queries.length && queries.length > 0}
                          aria-label="Select all queries on this page"
                        />
                      </th>
                    )}
                    <th>Customer</th>
                    <th>Subject</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {queries.map((query) => (
                    <tr key={query._id}>
                      {isStaff && (
                        <td style={{ paddingRight: 0 }}>
                          <input 
                            type="checkbox"
                            checked={selectedIds.includes(query._id)}
                            onChange={() => handleSelectRow(query._id)}
                            aria-label={`Select query: ${query.subject}`}
                          />
                        </td>
                      )}
                      <td>
                        <div style={{ fontWeight: 500 }}>{query.customerName}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{query.customerEmail}</div>
                      </td>
                      <td title={query.subject}>
                        <Link to={`/queries/${query._id}`} style={{ fontWeight: 500 }}>
                          {truncateText(query.subject, 30)}
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
                        <div className="table-actions">
                          <Link to={`/queries/${query._id}`} title="View Details">
                            <Button variant="secondary" size="sm" style={{ padding: '0.35rem', minWidth: 'auto' }}>
                              <MdVisibility style={{ fontSize: '1rem' }} />
                            </Button>
                          </Link>
                          <Link to={`/queries/${query._id}/edit`} title="Edit Query">
                            <Button variant="secondary" size="sm" style={{ padding: '0.35rem', minWidth: 'auto' }}>
                              <MdEdit style={{ fontSize: '1rem' }} />
                            </Button>
                          </Link>
                          {isStaff && (
                            <Button 
                              variant="danger" 
                              size="sm" 
                              style={{ padding: '0.35rem', minWidth: 'auto' }}
                              onClick={() => setDeletingId(query._id)}
                              title="Delete Query"
                            >
                              <MdDelete style={{ fontSize: '1rem' }} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginTop: 'var(--space-lg)' 
                }}
              >
                <span className="text-secondary" style={{ fontSize: '0.875rem' }}>
                  Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalDocs} total)
                </span>
                
                <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    icon={<MdArrowBack />}
                  >
                    Previous
                  </Button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
                    .map((p, idx, arr) => {
                      const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                      return (
                        <div key={p} style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                          {showEllipsis && <span style={{ alignSelf: 'center', padding: '0 var(--space-xs)' }}>...</span>}
                          <Button
                            variant={page === p ? 'primary' : 'secondary'}
                            size="sm"
                            style={{ minWidth: '2rem', padding: '0' }}
                            onClick={() => setPage(p)}
                          >
                            {p}
                          </Button>
                        </div>
                      );
                    })}

                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    icon={<MdArrowForward />}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </section>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteSingle}
        title="Delete Customer Query"
        message="Are you sure you want to delete this support query? It will be soft-deleted."
        confirmText="Yes, Delete"
      />

      <ConfirmationDialog
        isOpen={isBulkConfirmOpen}
        onClose={() => setIsBulkConfirmOpen(false)}
        onConfirm={handleBulkDelete}
        title="Bulk Delete Customer Queries"
        message={`Are you sure you want to delete the ${selectedIds.length} selected queries? This will soft-delete all of them.`}
        confirmText="Yes, Delete All"
        loading={bulkDeleting}
      />
    </div>
  );
};

export default QueryList;
