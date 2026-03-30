import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import CreatePostModal from './components/post/CreatePostModal';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="spinner" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

function Layout() {
  const { user }                  = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost]     = useState(null);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <Navbar onCreatePost={() => setShowModal(true)} />
      {showModal && (
        <CreatePostModal
          onClose={() => setShowModal(false)}
          onPostCreated={(p) => {
            setNewPost(p);
            setShowModal(false);
          }}
        />
      )}
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              openCreatePost={() => setShowModal(true)}
              newPost={newPost}
            />
          }
        />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1a1a',
              color: '#f0f0f0',
              border: '1px solid #2e2e2e',
              fontSize: '14px',
              borderRadius: '8px',
            },
          }}
        />
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            }
          />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}