import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth.js';
import Input from '../components/common/Input.jsx';
import Select from '../components/common/Select.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';

export const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'User',
    },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await registerUser(data);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Registration failed. Email might already be taken.');
    } finally {
      setSubmitting(false);
    }
  };

  const roleOptions = [
    { value: 'User', label: 'Customer (User)' },
    { value: 'Support', label: 'Support Agent' },
    { value: 'Admin', label: 'Administrator' },
  ];

  return (
    <div className="auth-wrapper">
      <Card className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span>CustomerQuery</span>
          </div>
          <p className="auth-subtitle">Create a new account to get started</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            error={errors.name?.message}
            required
            {...register('name', {
              required: 'Full name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters',
              },
            })}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            error={errors.email?.message}
            required
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            required
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            })}
          />

          <Select
            label="Account Role"
            options={roleOptions}
            error={errors.role?.message}
            required
            {...register('role', {
              required: 'Role selection is required',
            })}
          />

          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            style={{ width: '100%', marginTop: 'var(--space-md)' }}
          >
            Create Account
          </Button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="btn-link">
            Sign In
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;
