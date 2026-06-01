import React, { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import AppShell from '../components/layout/AppShell'
import PageTransition from '../components/shared/PageTransition'

const LandingPage = lazy(() => import('../pages/LandingPage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const RegisterPage = lazy(() => import('../pages/RegisterPage'))
const OnboardingPage = lazy(() => import('../pages/OnboardingPage'))
const GeneratingPage = lazy(() => import('../pages/GeneratingPage'))
const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const HistoryPage = lazy(() => import('../pages/HistoryPage'))
const TrendsPage = lazy(() => import('../pages/TrendsPage'))

export const router = createBrowserRouter([
  { path: '/', element: <PageTransition><LandingPage /></PageTransition> },
  { path: '/login', element: <PageTransition><LoginPage /></PageTransition> },
  { path: '/register', element: <PageTransition><RegisterPage /></PageTransition> },
  { path: '/onboarding', element: <ProtectedRoute><PageTransition><OnboardingPage /></PageTransition></ProtectedRoute> },
  { path: '/generating', element: <ProtectedRoute><PageTransition><GeneratingPage /></PageTransition></ProtectedRoute> },
  { path: '/dashboard', element: <ProtectedRoute><AppShell><PageTransition><DashboardPage /></PageTransition></AppShell></ProtectedRoute> },
  { path: '/history', element: <ProtectedRoute><AppShell><PageTransition><HistoryPage /></PageTransition></AppShell></ProtectedRoute> },
  { path: '/trends', element: <ProtectedRoute><AppShell><PageTransition><TrendsPage /></PageTransition></AppShell></ProtectedRoute> }
])

export default router
