import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, MessageSquare, Star, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { api, extractErrorMessage } from '@/services/api';

export default function FeedbackPage() {
  const [role, setRole] = useState<'student' | 'institution' | 'recruiter' | 'guest'>('student');
  const [rating, setRating] = useState(5);
  const [usabilityRating, setUsabilityRating] = useState(5);
  const [trustRating, setTrustRating] = useState(5);
  const [message, setMessage] = useState('');
  const [improvementSuggestion, setImprovementSuggestion] = useState('');
  const [consentToPublish, setConsentToPublish] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/feedback', {
        role,
        rating,
        usabilityRating,
        trustRating,
        message,
        improvementSuggestion: improvementSuggestion || undefined,
        consentToPublish,
      });
      if (!res.data.success) throw new Error(res.data.error.message);
      return res.data.data;
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success('Thank you for your feedback!');
    },
    onError: (err) => {
      toast.error(extractErrorMessage(err));
    },
  });

  const renderStars = (val: number, setVal: (n: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setVal(s)}
            className={`transition-colors ${
              s <= val
                ? 'text-amber-500 hover:text-amber-600'
                : 'text-primary-200 dark:text-primary-800 hover:text-primary-300'
            }`}
          >
            <Star className="h-6 w-6 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        {submitted ? (
          <div className="rounded-2xl border border-primary-100 bg-white p-8 text-center shadow-card dark:border-primary-800 dark:bg-primary-950">
            <CheckCircle2 className="mx-auto h-12 w-12 text-status-active" />
            <h2 className="mt-4 font-display text-2xl font-bold text-primary-900 dark:text-white">
              Feedback submitted!
            </h2>
            <p className="mt-2 text-sm text-primary-500">
              Your response has been saved directly to our system database. We appreciate your
              insights to make CertifyChain better.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setMessage('');
                setImprovementSuggestion('');
              }}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent-600 hover:underline"
            >
              Submit another response <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-primary-100 bg-white p-8 shadow-card dark:border-primary-800 dark:bg-primary-950">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-accent-600" />
              <h2 className="font-display text-xl font-bold text-primary-900 dark:text-white">
                Share your feedback
              </h2>
            </div>
            <p className="mt-1 text-sm text-primary-400">
              Help us evaluate the usability, reliability, and security of the platform.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (message.length < 5) {
                  toast.error('Message must be at least 5 characters long.');
                  return;
                }
                mutation.mutate();
              }}
              className="mt-6 space-y-5"
            >
              <div>
                <label
                  htmlFor="role"
                  className="text-xs font-semibold uppercase tracking-wider text-primary-400"
                >
                  Your role
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value as 'student' | 'institution' | 'recruiter' | 'guest')
                  }
                  className="mt-1 block w-full rounded-lg border border-primary-200 px-3 py-2 text-sm dark:border-primary-800 dark:bg-primary-900 dark:text-white"
                >
                  <option value="student">Student / Credential Holder</option>
                  <option value="institution">Academic Institution / Issuer</option>
                  <option value="recruiter">Recruiter / Verifier</option>
                  <option value="guest">Guest observer</option>
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-primary-400 block mb-1">
                    Overall rating
                  </div>
                  {renderStars(rating, setRating)}
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-primary-400 block mb-1">
                    Usability rating
                  </div>
                  {renderStars(usabilityRating, setUsabilityRating)}
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-primary-400 block mb-1">
                    Trust rating
                  </div>
                  {renderStars(trustRating, setTrustRating)}
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="text-xs font-semibold uppercase tracking-wider text-primary-400"
                >
                  Feedback message
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your experience (usability, speed, issues encountered)..."
                  required
                  rows={4}
                  className="mt-1 block w-full rounded-lg border border-primary-200 px-3 py-2 text-sm dark:border-primary-800 dark:bg-primary-900 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="improvementSuggestion"
                  className="text-xs font-semibold uppercase tracking-wider text-primary-400"
                >
                  Improvement suggestions (Optional)
                </label>
                <textarea
                  id="improvementSuggestion"
                  value={improvementSuggestion}
                  onChange={(e) => setImprovementSuggestion(e.target.value)}
                  placeholder="Any features or updates you'd like to see?"
                  rows={2}
                  className="mt-1 block w-full rounded-lg border border-primary-200 px-3 py-2 text-sm dark:border-primary-800 dark:bg-primary-900 dark:text-white"
                />
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consentToPublish}
                  onChange={(e) => setConsentToPublish(e.target.checked)}
                  className="mt-1 rounded border-primary-200 text-accent-600 focus:ring-accent-500"
                />
                <label htmlFor="consent" className="text-xs text-primary-500 leading-tight">
                  I consent to publish this feedback on the public board/admin section.
                </label>
              </div>

              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full rounded-lg bg-accent-600 py-2.5 text-sm font-semibold text-white shadow-button hover:bg-accent-700 disabled:opacity-50"
              >
                {mutation.isPending ? 'Submitting…' : 'Submit feedback'}
              </button>
            </form>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
