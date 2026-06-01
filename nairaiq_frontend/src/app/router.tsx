import React, { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import AppShell from '../components/layout/AppShell'

const LandingPage = lazy(() => import('../pages/LandingPage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const RegisterPage = lazy(() => import('../pages/RegisterPage'))
const OnboardingPage = lazy(() => import('../pages/OnboardingPage'))
const GeneratingPage = lazy(() => import('../pages/GeneratingPage'))
const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const HistoryPage = lazy(() => import('../pages/HistoryPage'))
const TrendsPage = lazy(() => import('../pages/TrendsPage'))

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/onboarding', element: <ProtectedRoute><OnboardingPage /></ProtectedRoute> },
  { path: '/generating', element: <ProtectedRoute><GeneratingPage /></ProtectedRoute> },
  { path: '/dashboard', element: <ProtectedRoute><AppShell><DashboardPage /></AppShell></ProtectedRoute> },
  { path: '/history', element: <ProtectedRoute><AppShell><HistoryPage /></AppShell></ProtectedRoute> },
  { path: '/trends', element: <ProtectedRoute><AppShell><TrendsPage /></AppShell></ProtectedRoute> }
])

export default router
