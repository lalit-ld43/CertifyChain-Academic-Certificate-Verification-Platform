import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { RequireAuth, RequireRole } from '@/components/auth/RouteGuards';
import { UserRole } from '@certifychain/shared';

const Landing = lazy(() => import('@/pages/Landing'));
const About = lazy(() => import('@/pages/About'));
const Institutions = lazy(() => import('@/pages/Institutions'));
const VerifyLanding = lazy(() => import('@/pages/VerifyLanding'));
const VerifyCredential = lazy(() => import('@/pages/VerifyCredential'));
const ShareView = lazy(() => import('@/pages/ShareView'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const FeedbackPage = lazy(() => import('@/pages/FeedbackPage'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Terms = lazy(() => import('@/pages/Terms'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const StudentDashboard = lazy(() => import('@/pages/StudentDashboard'));
const StudentCredentials = lazy(() => import('@/pages/StudentCredentials'));
const StudentCredentialDetail = lazy(() => import('@/pages/StudentCredentialDetail'));
const StudentProfile = lazy(() => import('@/pages/StudentProfile'));
const StudentSettings = lazy(() => import('@/pages/StudentSettings'));

const InstitutionDashboard = lazy(() => import('@/pages/InstitutionDashboard'));
const InstitutionApplication = lazy(() => import('@/pages/InstitutionApplication'));
const InstitutionCredentials = lazy(() => import('@/pages/InstitutionCredentials'));
const InstitutionCredentialNew = lazy(() => import('@/pages/InstitutionCredentialNew'));
const InstitutionCredentialDetail = lazy(() => import('@/pages/InstitutionCredentialDetail'));
const InstitutionBulkIssue = lazy(() => import('@/pages/InstitutionBulkIssue'));
const InstitutionAnalytics = lazy(() => import('@/pages/InstitutionAnalytics'));
const InstitutionSettings = lazy(() => import('@/pages/InstitutionSettings'));

const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const AdminInstitutions = lazy(() => import('@/pages/AdminInstitutions'));
const AdminInstitutionDetail = lazy(() => import('@/pages/AdminInstitutionDetail'));
const AdminCredentials = lazy(() => import('@/pages/AdminCredentials'));
const AdminUsers = lazy(() => import('@/pages/AdminUsers'));
const AdminFeedback = lazy(() => import('@/pages/AdminFeedback'));
const AdminSystem = lazy(() => import('@/pages/AdminSystem'));

function PageFallback() {
  return <div className="p-10 text-center text-sm text-primary-400">Loading…</div>;
}

export default function App() {
  return (
    <>
      <Toaster richColors position="top-right" />
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/institutions" element={<Institutions />} />
          <Route path="/verify" element={<VerifyLanding />} />
          <Route path="/verify/:credentialId" element={<VerifyCredential />} />
          <Route path="/share/:shareToken" element={<ShareView />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* Student */}
          <Route
            path="/student/dashboard"
            element={
              <RequireAuth>
                <RequireRole role={UserRole.STUDENT}>
                  <StudentDashboard />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/student/credentials"
            element={
              <RequireAuth>
                <RequireRole role={UserRole.STUDENT}>
                  <StudentCredentials />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/student/credentials/:id"
            element={
              <RequireAuth>
                <RequireRole role={UserRole.STUDENT}>
                  <StudentCredentialDetail />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/student/profile"
            element={
              <RequireAuth>
                <RequireRole role={UserRole.STUDENT}>
                  <StudentProfile />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/student/settings"
            element={
              <RequireAuth>
                <RequireRole role={UserRole.STUDENT}>
                  <StudentSettings />
                </RequireRole>
              </RequireAuth>
            }
          />

          {/* Institution */}
          <Route
            path="/institution/dashboard"
            element={
              <RequireAuth>
                <RequireRole role={UserRole.INSTITUTION}>
                  <InstitutionDashboard />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/institution/application"
            element={
              <RequireAuth>
                <RequireRole role={UserRole.INSTITUTION}>
                  <InstitutionApplication />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/institution/credentials"
            element={
              <RequireAuth>
                <RequireRole role={UserRole.INSTITUTION}>
                  <InstitutionCredentials />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/institution/credentials/new"
            element={
              <RequireAuth>
                <RequireRole role={UserRole.INSTITUTION}>
                  <InstitutionCredentialNew />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/institution/credentials/:id"
            element={
              <RequireAuth>
                <RequireRole role={UserRole.INSTITUTION}>
                  <InstitutionCredentialDetail />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/institution/bulk-issue"
            element={
              <RequireAuth>
                <RequireRole role={UserRole.INSTITUTION}>
                  <InstitutionBulkIssue />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/institution/analytics"
            element={
              <RequireAuth>
                <RequireRole role={UserRole.INSTITUTION}>
                  <InstitutionAnalytics />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/institution/settings"
            element={
              <RequireAuth>
                <RequireRole role={UserRole.INSTITUTION}>
                  <InstitutionSettings />
                </RequireRole>
              </RequireAuth>
            }
          />

          {/* Admin */}
          <Route
            path="/admin/dashboard"
            element={
              <RequireAuth>
                <RequireRole role={UserRole.ADMIN}>
                  <AdminDashboard />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/admin/institutions"
            element={
              <RequireAuth>
                <RequireRole role={UserRole.ADMIN}>
                  <AdminInstitutions />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/admin/institutions/:id"
            element={
              <RequireAuth>
                <RequireRole role={UserRole.ADMIN}>
                  <AdminInstitutionDetail />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/admin/credentials"
            element={
              <RequireAuth>
                <RequireRole role={UserRole.ADMIN}>
                  <AdminCredentials />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RequireAuth>
                <RequireRole role={UserRole.ADMIN}>
                  <AdminUsers />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/admin/feedback"
            element={
              <RequireAuth>
                <RequireRole role={UserRole.ADMIN}>
                  <AdminFeedback />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/admin/system"
            element={
              <RequireAuth>
                <RequireRole role={UserRole.ADMIN}>
                  <AdminSystem />
                </RequireRole>
              </RequireAuth>
            }
          />

          <Route path="/not-found" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
