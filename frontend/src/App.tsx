import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { RequireAuth } from './components/RequireAuth'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { RecipesPage } from './pages/RecipesPage'
import { RecipeDetailPage } from './pages/RecipeDetailPage'
import { RecipeFormPage } from './pages/RecipeFormPage'
import { VersionsPage } from './pages/VersionsPage'

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <RequireAuth>
                <Layout>
                  <DashboardPage />
                </Layout>
              </RequireAuth>
            }
          />
          <Route
            path="/recipes"
            element={
              <RequireAuth>
                <Layout>
                  <RecipesPage />
                </Layout>
              </RequireAuth>
            }
          />
          <Route
            path="/recipes/new"
            element={
              <RequireAuth>
                <Layout>
                  <RecipeFormPage />
                </Layout>
              </RequireAuth>
            }
          />
          <Route
            path="/recipes/:id"
            element={
              <RequireAuth>
                <Layout>
                  <RecipeDetailPage />
                </Layout>
              </RequireAuth>
            }
          />
          <Route
            path="/recipes/:id/edit"
            element={
              <RequireAuth>
                <Layout>
                  <RecipeFormPage />
                </Layout>
              </RequireAuth>
            }
          />
          <Route
            path="/recipes/:id/versions"
            element={
              <RequireAuth>
                <Layout>
                  <VersionsPage />
                </Layout>
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}
