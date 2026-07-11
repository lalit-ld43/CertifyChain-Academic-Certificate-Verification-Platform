import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  GraduationCap,
  Search,
  Lock,
  QrCode,
  FileCheck2,
  ArrowRight,
} from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { StatusBadge } from '@/components/verification/StatusBadge';

export default function LandingPage() {
  return (
    <PublicLayout>
      {/* 1. Hero */}
      <section className="bg-gradient-to-b from-primary-50 to-white px-4 py-20 dark:from-primary-950 dark:to-surface-dark sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-500/10 px-3 py-1 text-xs font-semibold text-accent-600">
            <ShieldCheck className="h-3.5 w-3.5" /> Built on Stellar Testnet
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-primary-900 dark:text-white sm:text-5xl">
            Verify academic achievements with confidence.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-primary-600 dark:text-primary-300">
            Institutions issue tamper-evident credentials on Stellar. Students control sharing.
            Recruiters verify authenticity in seconds.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/verify"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-800 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
            >
              Verify a certificate <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg border border-primary-200 px-6 py-3 font-semibold text-primary-700 transition hover:bg-primary-50 dark:border-primary-700 dark:text-primary-200"
            >
              Register your institution
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Problem */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-primary-900 dark:text-white">
            Certificate fraud and slow manual checks cost everyone time and trust
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              {
                title: 'Forged documents',
                body: 'Screenshots and PDFs can be edited convincingly, with no easy way to check.',
              },
              {
                title: 'Slow manual verification',
                body: 'Employers wait days or weeks for a registrar to confirm a single certificate.',
              },
              {
                title: 'Repeated PII exposure',
                body: 'Students re-share sensitive documents with every new recruiter or platform.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl2 border border-primary-100 p-6 shadow-card dark:border-primary-800"
              >
                <h3 className="font-semibold text-primary-800 dark:text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-primary-500">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. How it works */}
      <section className="bg-primary-50 px-4 py-16 dark:bg-primary-950/40 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-primary-900 dark:text-white">
            How CertifyChain works
          </h2>
          <ol className="mt-10 grid gap-6 sm:grid-cols-4">
            {[
              { step: '1', title: 'Institution issues', icon: Building2 },
              { step: '2', title: 'Hash recorded on Stellar', icon: Lock },
              { step: '3', title: 'Student shares a link or QR', icon: QrCode },
              { step: '4', title: 'Recruiter verifies instantly', icon: FileCheck2 },
            ].map(({ step, title, icon: Icon }) => (
              <li
                key={step}
                className="rounded-xl2 bg-white p-6 text-center shadow-card dark:bg-primary-900"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-500/10 text-accent-600">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="mt-3 text-xs font-semibold text-accent-600">STEP {step}</div>
                <div className="mt-1 font-semibold text-primary-800 dark:text-white">{title}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4-6. Benefits */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {[
            {
              icon: Building2,
              title: 'For institutions',
              body: 'Issue once, on-chain. No more repeated manual verification calls from employers.',
            },
            {
              icon: GraduationCap,
              title: 'For students',
              body: 'Own your credentials. Share a single revocable link instead of scanned documents.',
            },
            {
              icon: Search,
              title: 'For recruiters',
              body: 'Verify by ID, QR, link, or file hash — no account required, results in seconds.',
            },
          ].map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-xl2 border border-primary-100 p-8 dark:border-primary-800"
            >
              <Icon className="h-8 w-8 text-primary-700 dark:text-accent-400" />
              <h3 className="mt-4 text-lg font-semibold text-primary-900 dark:text-white">
                {title}
              </h3>
              <p className="mt-2 text-sm text-primary-500">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Live verification demonstration */}
      <section className="bg-primary-900 px-4 py-16 text-white sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold">See a verification result</h2>
          <p className="mt-2 text-primary-200">
            Every check returns one clear status — no ambiguity, no guesswork.
          </p>
          <div className="mx-auto mt-8 max-w-sm rounded-xl2 bg-white p-6 text-left text-primary-900 shadow-card">
            <div className="text-xs font-semibold uppercase tracking-wide text-primary-400">
              Bachelor of Technology
            </div>
            <div className="mt-1 text-lg font-semibold">
              Issued by Stellar Institute of Technology
            </div>
            <div className="mt-4">
              <StatusBadge result="valid" />
            </div>
          </div>
        </div>
      </section>

      {/* 8. Security & privacy */}
      <section className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <Lock className="mx-auto h-8 w-8 text-accent-500" />
          <h2 className="mt-4 text-2xl font-bold text-primary-900 dark:text-white">
            Privacy by design
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-primary-500">
            Only a cryptographic hash, wallet addresses, and timestamps ever touch the blockchain.
            Names, grades, and documents stay in encrypted off-chain storage, under the
            student&apos;s control.
          </p>
        </div>
      </section>

      {/* 10. CTA */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-xl2 bg-accent-500/10 p-10 text-center">
          <h2 className="text-2xl font-bold text-primary-900 dark:text-white">
            Ready to issue trustworthy credentials?
          </h2>
          <Link
            to="/register"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-800 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
          >
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
