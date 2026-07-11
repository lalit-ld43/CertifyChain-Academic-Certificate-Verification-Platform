import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { loginSchema, type LoginInput, type ApiResponse, type UserDTO } from '@certifychain/shared';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { api, extractErrorMessage } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { track } from '@/services/analytics';
import { AnalyticsEvent } from '@certifychain/shared';

export default function LoginPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setSubmitting(true);
    try {
      const res = await api.post<ApiResponse<{ accessToken: string; user: UserDTO }>>(
        '/auth/login',
        values,
      );
      if (!res.data.success) throw new Error(res.data.error.message);
      useAuthStore.getState().setAccessToken(res.data.data.accessToken);
      useAuthStore.getState().setUser(res.data.data.user);
      track(AnalyticsEvent.USER_LOGGED_IN);
      toast.success('Welcome back!');
      const role = res.data.data.user.role;
      navigate(
        role === 'student'
          ? '/student/dashboard'
          : role === 'institution'
            ? '/institution/dashboard'
            : role === 'admin'
              ? '/admin/dashboard'
              : '/',
      );
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PublicLayout>
      <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16 sm:px-6">
        <h1 className="text-center font-display text-2xl font-bold text-primary-900 dark:text-white">
          Log in to CertifyChain
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-primary-700 dark:text-primary-200"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className="mt-1 w-full rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none dark:border-primary-700 dark:bg-primary-900"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="mt-1 text-xs text-status-revoked">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-primary-700 dark:text-primary-200"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              className="mt-1 w-full rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none dark:border-primary-700 dark:bg-primary-900"
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-status-revoked">{errors.password.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-primary-800 px-4 py-2.5 font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-primary-500">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-accent-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </PublicLayout>
  );
}
