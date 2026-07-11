import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  registerSchema,
  type RegisterInput,
  type ApiResponse,
  type UserDTO,
  UserRole,
} from '@certifychain/shared';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { api, extractErrorMessage } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { track } from '@/services/analytics';
import { AnalyticsEvent } from '@certifychain/shared';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterInput) {
    setSubmitting(true);
    try {
      const res = await api.post<ApiResponse<{ accessToken: string; user: UserDTO }>>(
        '/auth/register',
        values,
      );
      if (!res.data.success) throw new Error(res.data.error.message);
      useAuthStore.getState().setAccessToken(res.data.data.accessToken);
      useAuthStore.getState().setUser(res.data.data.user);
      track(AnalyticsEvent.USER_REGISTERED, { role: values.role });
      toast.success('Account created!');
      navigate(values.role === 'student' ? '/student/dashboard' : '/institution/dashboard');
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
          Create your account
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-primary-700 dark:text-primary-200"
            >
              Full name
            </label>
            <input
              id="name"
              {...register('name')}
              className="mt-1 w-full rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none dark:border-primary-700 dark:bg-primary-900"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-status-revoked">{errors.name.message}</p>
            )}
          </div>
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
              {...register('email')}
              className="mt-1 w-full rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none dark:border-primary-700 dark:bg-primary-900"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-status-revoked">{errors.email.message}</p>
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
              {...register('password')}
              className="mt-1 w-full rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-accent-500 focus:outline-none dark:border-primary-700 dark:bg-primary-900"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-status-revoked">{errors.password.message}</p>
            )}
          </div>
          <div>
            <span className="block text-sm font-medium text-primary-700 dark:text-primary-200">
              I am a…
            </span>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[
                { value: UserRole.STUDENT, label: 'Student' },
                { value: UserRole.INSTITUTION, label: 'Institution' },
                { value: UserRole.RECRUITER, label: 'Recruiter' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center justify-center rounded-lg border border-primary-200 px-2 py-2 text-sm has-[:checked]:border-accent-500 has-[:checked]:bg-accent-500/10 dark:border-primary-700"
                >
                  <input type="radio" value={opt.value} {...register('role')} className="sr-only" />
                  {opt.label}
                </label>
              ))}
            </div>
            {errors.role && <p className="mt-1 text-xs text-status-revoked">Choose a role</p>}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-primary-800 px-4 py-2.5 font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-primary-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-accent-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </PublicLayout>
  );
}
