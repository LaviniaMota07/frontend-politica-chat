import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Chat from './pages/Chat/Chat';
import ChatRoom from './pages/Chat/ChatRoom';
import AdminUsers from './pages/AdminUsers/AdminUsers';
import AdminDocuments from './pages/AdminDocuments/AdminDocuments';
import AdminDocumentDetail from './pages/AdminDocuments/AdminDocumentDetail';
import AdminDepartments, { AdminSystems } from './pages/AdminCatalogs/AdminCatalogs';
import AdminPermissionGroups from './pages/AdminPermissionGroups/AdminPermissionGroups';
import AdminTokens from './pages/AdminTokens/AdminTokens';
import ProfileEdit from './pages/ProfileEdit/ProfileEdit';
import ProtectedRoute from './components/ProtectedRoute';
import { ChatHistoryProvider } from './contexts/ChatHistoryContext';

function App() {
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
            <ChatHistoryProvider>
              <DashboardLayout />
            </ChatHistoryProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/login" replace />} />
        <Route
          path="chat"
          element={
            <ProtectedRoute allowedRoles={['1', '2']}>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="chat/:chatId"
          element={
            <ProtectedRoute allowedRoles={['1', '2']}>
              <ChatRoom />
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
            <ProtectedRoute allowedRoles={['1']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/documents"
          element={
            <ProtectedRoute allowedRoles={['1']}>
              <AdminDocuments />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/documents/:documentId"
          element={
            <ProtectedRoute allowedRoles={['1']}>
              <AdminDocumentDetail />
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
            <ProtectedRoute allowedRoles={['1']}>
              <AdminDepartments />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/systems"
          element={
            <ProtectedRoute allowedRoles={['1']}>
              <AdminSystems />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/permission-groups"
          element={
            <ProtectedRoute allowedRoles={['1']}>
              <AdminPermissionGroups />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/tokens"
          element={
            <ProtectedRoute allowedRoles={['1']}>
              <AdminTokens />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/chat" replace />} />
    </Routes>
  );
}

export default App;
