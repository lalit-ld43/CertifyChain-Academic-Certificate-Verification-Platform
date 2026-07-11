import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import clsx from 'clsx';

const publicLinks = [
  { to: '/', label: 'Home' },
  { to: '/institutions', label: 'Institutions' },
  { to: '/verify', label: 'Verify a Certificate' },
  { to: '/about', label: 'About' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuthStore();

  const dashboardHref = user
    ? user.role === 'student'
      ? '/student/dashboard'
      : user.role === 'institution'
        ? '/institution/dashboard'
        : user.role === 'admin'
          ? '/admin/dashboard'
          : '/'
    : null;

  return (
    <header className="sticky top-0 z-40 border-b border-primary-100 bg-white/80 backdrop-blur dark:border-primary-800 dark:bg-surface-dark/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-primary-800 dark:text-white">
          <ShieldCheck className="h-6 w-6 text-accent-500" aria-hidden="true" />
          CertifyChain
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {publicLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                clsx(
                  'text-sm font-medium transition-colors hover:text-accent-600',
                  isActive ? 'text-accent-600' : 'text-primary-600 dark:text-primary-200',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {dashboardHref ? (
            <Link
              to={dashboardHref}
              className="rounded-lg bg-primary-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-primary-600 hover:text-accent-600">
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-primary-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-primary-100 px-4 pb-4 md:hidden dark:border-primary-800">
          <div className="flex flex-col gap-3 pt-3">
            {publicLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-primary-700 dark:text-primary-200"
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-2 flex gap-3">
              {dashboardHref ? (
                <Link
                  to={dashboardHref}
                  className="flex-1 rounded-lg bg-primary-800 px-4 py-2 text-center text-sm font-semibold text-white"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="flex-1 rounded-lg border border-primary-200 px-4 py-2 text-center text-sm font-medium">
                    Log in
                  </Link>
                  <Link to="/register" className="flex-1 rounded-lg bg-primary-800 px-4 py-2 text-center text-sm font-semibold text-white">
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
