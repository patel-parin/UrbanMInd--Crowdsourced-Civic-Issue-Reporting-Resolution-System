import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';


// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RoleSelect from './pages/auth/RoleSelect';

import CitizenDashboard from './pages/citizen/Dashboard';
import ReportIssue from './pages/citizen/ReportIssue';
import IssueHistory from './pages/citizen/IssueHistory';
import IssueDetails from './pages/citizen/IssueDetails';
import MapView from './pages/citizen/MapView';
import Profile from './pages/citizen/Profile';
import Layout from './components/layout/Layout';

import AdminDashboard from './pages/admin/Dashboard';
import IssueList from './pages/admin/IssueList';
import ContractorList from './pages/admin/ContractorList';
import Analytics from './pages/admin/Analytics';
import SuperAdminDashboard from './pages/admin/SuperAdminDashboard';

import ContractorDashboard from './pages/contractor/Dashboard';
import CompletedTasks from './pages/contractor/CompletedTasks';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen text-white font-sans">
          <Toaster position="top-right" />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/role-select" element={<RoleSelect />} />
            <Route path="/" element={<Navigate to="/role-select" replace />} />

            {/* Citizen Routes */}
            <Route
              path="/citizen/*"
              element={
                <ProtectedRoute allowedRoles={['citizen']}>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<CitizenDashboard />} />
                      <Route path="report" element={<ReportIssue />} />
                      <Route path="history" element={<IssueHistory />} />
                      <Route path="issue/:id" element={<IssueDetails />} />
                      <Route path="map" element={<MapView />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="issues" element={<IssueList />} />
                      <Route path="contractors" element={<ContractorList />} />
                      <Route path="analytics" element={<Analytics />} />
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Super Admin Routes */}
            <Route
              path="/superadmin/*"
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<SuperAdminDashboard />} />
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Contractor Routes */}
            <Route
              path="/contractor/*"
              element={
                <ProtectedRoute allowedRoles={['contractor']}>
                  <Layout>
                    <Routes>
                      <Route path="dashboard" element={<ContractorDashboard />} />
                      <Route path="tasks" element={<ContractorDashboard />} />
                      <Route path="completed" element={<CompletedTasks />} />
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
