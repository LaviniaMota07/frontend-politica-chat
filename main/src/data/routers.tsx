import { Routes, Route, Navigate } from 'react-router-dom';

import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';

import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import Chat from '../pages/Chat/Chat';
import AdminUsers from '../pages/AdminUsers/AdminUsers';
import AdminDocuments from '../pages/AdminDocuments/AdminDocuments';
import AdminDepartments, { AdminSystems } from '../pages/AdminCatalogs/AdminCatalogs';
import AdminTokens from '../pages/AdminTokens/AdminTokens';
import ProfileEdit from '../pages/ProfileEdit/ProfileEdit';

import ProtectedRoute from '../components/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/chat" replace />} />

        <Route
          path="chat"
          element={
            <ProtectedRoute allowedRoles={['1', '2']}>
              <Chat />
            </ProtectedRoute>
          }
        />

        <Route
          path="profile/edit"
          element={
            <ProtectedRoute allowedRoles={['1', '2']}>
              <ProfileEdit />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin/users"
          element={
            <ProtectedRoute allowedRoles={['2']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin/documents"
          element={
            <ProtectedRoute allowedRoles={['2']}>
              <AdminDocuments />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin/catalogs"
          element={<Navigate to="/admin/departments" replace />}
        />

        <Route
          path="admin/departments"
          element={
            <ProtectedRoute allowedRoles={['2']}>
              <AdminDepartments />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin/systems"
          element={
            <ProtectedRoute allowedRoles={['2']}>
              <AdminSystems />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin/tokens"
          element={
            <ProtectedRoute allowedRoles={['2']}>
              <AdminTokens />
            </ProtectedRoute>
          }
        />

      </Route>

      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  );
}
