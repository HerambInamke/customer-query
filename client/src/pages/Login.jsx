import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth.js';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await login(data);
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <Card className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <span>CustomerQuery</span>
          </div>
          <p className="auth-subtitle">Sign in to your support agent dashboard</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
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

          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            style={{ width: '100%', marginTop: 'var(--space-md)' }}
          >
            Sign In
          </Button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" className="btn-link">
            Create Account
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
