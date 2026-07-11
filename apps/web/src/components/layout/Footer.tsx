import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-primary-100 bg-white dark:border-primary-800 dark:bg-surface-dark">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 font-display text-lg font-bold text-primary-800 dark:text-white">
              <ShieldCheck className="h-5 w-5 text-accent-500" />
              CertifyChain
            </div>
            <p className="mt-3 max-w-xs text-sm text-primary-500">
              Tamper-evident academic credentials on Stellar. Verify in seconds, not weeks.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary-800 dark:text-white">Product</h3>
            <ul className="mt-3 space-y-2 text-sm text-primary-500">
              <li>
                <Link to="/verify" className="hover:text-accent-600">
                  Verify a certificate
                </Link>
              </li>
              <li>
                <Link to="/institutions" className="hover:text-accent-600">
                  Institutions
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-accent-600">
                  About
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary-800 dark:text-white">Legal</h3>
            <ul className="mt-3 space-y-2 text-sm text-primary-500">
              <li>
                <Link to="/privacy" className="hover:text-accent-600">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-accent-600">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-primary-800 dark:text-white">Community</h3>
            <ul className="mt-3 space-y-2 text-sm text-primary-500">
              <li>
                <Link to="/feedback" className="hover:text-accent-600">
                  Give feedback
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-primary-100 pt-6 text-xs text-primary-400 dark:border-primary-800">
          &copy; {new Date().getFullYear()} CertifyChain. Built on Stellar Testnet.
        </div>
      </div>
    </footer>
  );
}
