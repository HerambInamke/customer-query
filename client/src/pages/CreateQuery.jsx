import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import queryService from '../services/queryService.js';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import Textarea from '../components/common/Textarea.jsx';
import Select from '../components/common/Select.jsx';
import Button from '../components/common/Button.jsx';
import { TICKET_PRIORITY, TICKET_CATEGORY } from '../constants/index.js';
import { getErrorMessage } from '../utils/helpers.js';

export const CreateQuery = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      subject: '',
      description: '',
      priority: TICKET_PRIORITY.MEDIUM,
      category: '',
      tagsInput: '',
    },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      // Process tagsInput comma-delimited string into array of strings
      const tags = data.tagsInput
        ? data.tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
        : [];
      
      const payload = {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone || undefined,
        subject: data.subject,
        description: data.description,
        priority: data.priority,
        category: data.category,
        tags,
      };

      const response = await queryService.createQuery(payload);
      if (response.success) {
        toast.success('Support query created successfully!');
        navigate('/queries');
      }
    } catch (err) {
      toast.error(getErrorMessage(err) || 'Failed to create support query.');
    } finally {
      setSubmitting(false);
    }
  };

  const priorityOptions = Object.values(TICKET_PRIORITY).map((p) => ({ value: p, label: p }));
  const categoryOptions = [
    { value: '', label: 'Select a category' },
    ...Object.values(TICKET_CATEGORY).map((c) => ({ value: c, label: c })),
  ];

  return (
    <div className="page-container">
      <header className="page-header">
        <div>
          <h1 className="page-title">New Query</h1>
          <p className="text-secondary">Open a new customer support ticket in the system.</p>
        </div>
      </header>

      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <Card title="Query Information">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            
            {/* Customer Name */}
            <Input
              label="Customer Name"
              type="text"
              placeholder="e.g. Michael Thompson"
              error={errors.customerName?.message}
              required
              {...register('customerName', {
                required: 'Customer name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
                maxLength: { value: 150, message: 'Name cannot exceed 150 characters' },
              })}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              {/* Customer Email */}
              <Input
                label="Customer Email"
                type="email"
                placeholder="michael@company.com"
                error={errors.customerEmail?.message}
                required
                {...register('customerEmail', {
                  required: 'Customer email is required',
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: 'Please provide a valid email address',
                  },
                })}
              />

              {/* Customer Phone */}
              <Input
                label="Customer Phone"
                type="tel"
                placeholder="+1-555-0101"
                error={errors.customerPhone?.message}
                {...register('customerPhone', {
                  pattern: {
                    value: /^[+]?[\d\s\-().]{7,20}$/,
                    message: 'Please provide a valid phone number',
                  },
                })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              {/* Category */}
              <Select
                label="Category"
                options={categoryOptions}
                error={errors.category?.message}
                required
                {...register('category', {
                  required: 'Please select a category',
                })}
              />

              {/* Priority */}
              <Select
                label="Priority"
                options={priorityOptions}
                error={errors.priority?.message}
                required
                {...register('priority', {
                  required: 'Please select a priority',
                })}
              />
            </div>

            {/* Subject */}
            <Input
              label="Subject"
              type="text"
              placeholder="e.g. Account login failure"
              error={errors.subject?.message}
              required
              {...register('subject', {
                required: 'Subject is required',
                minLength: { value: 5, message: 'Subject must be at least 5 characters' },
                maxLength: { value: 255, message: 'Subject cannot exceed 255 characters' },
              })}
            />

            {/* Description */}
            <Textarea
              label="Description"
              placeholder="Describe the customer query detailed error description..."
              error={errors.description?.message}
              required
              {...register('description', {
                required: 'Description is required',
                minLength: { value: 10, message: 'Description must be at least 10 characters' },
                maxLength: { value: 5000, message: 'Description cannot exceed 5000 characters' },
              })}
            />

            {/* Tags Input */}
            <Input
              label="Tags (Comma separated)"
              type="text"
              placeholder="e.g. login, portal, billing"
              error={errors.tagsInput?.message}
              {...register('tagsInput')}
            />

            <div className="form-actions">
              <Link to="/queries">
                <Button variant="secondary" disabled={submitting}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" variant="primary" loading={submitting}>
                Submit Query
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateQuery;
