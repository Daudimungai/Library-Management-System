import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { BookOpen, Users, Home, RotateCcw } from 'lucide-react';
import Books from './components/Books';
import Students from './components/Students';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Returns from './components/Returns';
import { getAdminByUsername } from './db';
import type { AuthState, Admin } from './types';

function RequireAuth({ children }: { children: JSX.Element }) {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function useAuth() {
  const [auth, setAuth] = useState<AuthState>(() => {
    const savedAuth = localStorage.getItem('auth');
    return savedAuth ? JSON.parse(savedAuth) : { isAuthenticated: false, user: null };
  });

  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify(auth));
  }, [auth]);

  const login = async (username: string, password: string) => {
    const admin = await getAdminByUsername(username);
    if (admin && admin.password === password) { // In production, use proper password hashing
      setAuth({ isAuthenticated: true, user: admin });
      return true;
    }
    return false;
  };

  const logout = () => {
    setAuth({ isAuthenticated: false, user: null });
  };

  return { ...auth, login, logout };
}

function App() {
  const auth = useAuth();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        {auth.isAuthenticated && (
          <nav className="bg-indigo-600 text-white p-4">
            <div className="container mx-auto flex items-center justify-between">
              <h1 className="text-2xl font-bold">School Library</h1>
              <div className="flex gap-4">
                <Link to="/" className="flex items-center gap-2 hover:text-indigo-200">
                  <Home size={20} />
                  Home
                </Link>
                <Link to="/books" className="flex items-center gap-2 hover:text-indigo-200">
                  <BookOpen size={20} />
                  Books
                </Link>
                <Link to="/students" className="flex items-center gap-2 hover:text-indigo-200">
                  <Users size={20} />
                  Students
                </Link>
                <Link to="/returns" className="flex items-center gap-2 hover:text-indigo-200">
                  <RotateCcw size={20} />
                  Returns
                </Link>
                <button
                  onClick={() => auth.logout()}
                  className="flex items-center gap-2 hover:text-indigo-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </nav>
        )}

        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/login" element={
              auth.isAuthenticated ? 
                <Navigate to="/" replace /> : 
                <Login onLogin={auth.login} />
            } />
            <Route path="/" element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            } />
            <Route path="/books" element={
              <RequireAuth>
                <Books />
              </RequireAuth>
            } />
            <Route path="/students" element={
              <RequireAuth>
                <Students />
              </RequireAuth>
            } />
            <Route path="/returns" element={
              <RequireAuth>
                <Returns />
              </RequireAuth>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;