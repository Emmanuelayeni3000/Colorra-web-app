import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { Eye, EyeOff, ArrowRight, Mail, RefreshCw } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { apiClient } from '@/lib/api'
import { AxiosError } from 'axios'

export default function SignInPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [requiresVerification, setRequiresVerification] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleResendVerification = async () => {
    setResendLoading(true)
    setResendMessage('')
    try {
      const response = await apiClient.resendVerificationEmail(unverifiedEmail)
      setResendMessage(response.message || 'Verification email sent!')
    } catch {
      setResendMessage('Failed to resend. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setRequiresVerification(false)
    setIsLoading(true)

    try {
      const data = await apiClient.signIn(formData)
      login(data.user, data.token)

      const { redirect } = router.query;
      if (redirect && typeof redirect === 'string') {
        router.push(redirect);
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        // Check if it's a verification required error
        if (err.response?.status === 403 && err.response?.data?.requiresVerification) {
          setRequiresVerification(true)
          setUnverifiedEmail(err.response?.data?.email || formData.email)
          setError(err.response?.data?.message || 'Please verify your email before signing in.')
        } else {
          setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
        }
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Sample palette colors for the decorative panel
  const samplePalettes = [
    ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE'],
    ['#14B8A6', '#2DD4BF', '#5EEAD4', '#99F6E4', '#CCFBF1'],
    ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7'],
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-purple-600 to-violet-700 relative overflow-hidden">
        {/* Animated background shapes */}
        <motion.div 
          className="absolute top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 -right-20 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            y: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-400/10 rounded-full blur-2xl"
          animate={{ 
            rotate: [0, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8">
              <Image 
                src="/images/colorra-logo.png" 
                alt="Colorra Logo" 
                width={140} 
                height={45}
                className="brightness-0 invert opacity-95"
              />
            </div>

            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
              Welcome back to your creative space
            </h1>
            <p className="text-lg text-white/80 mb-12 max-w-md">
              Sign in to access your palettes, discover new colors, and connect with the creative community.
            </p>

            {/* Sample palettes preview */}
            <div className="space-y-4">
              <p className="text-sm font-medium text-white/60 uppercase tracking-wider">Featured Palettes</p>
              <div className="space-y-3">
                {samplePalettes.map((palette, idx) => (
                  <motion.div 
                    key={idx}
                    className="flex rounded-lg overflow-hidden shadow-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                  >
                    {palette.map((color, colorIdx) => (
                      <div 
                        key={colorIdx}
                        className="h-10 flex-1"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Sign In Form */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-violet-50 to-gray-50 lg:bg-gray-50 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 min-h-screen lg:min-h-0">
        <motion.div 
          className="max-w-md w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6 sm:mb-8">
            <Link href="/" className="inline-block">
              <Image src="/images/colorra-logo.png" alt="Colorra Logo" width={100} height={32} className="sm:w-[120px]" />
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Sign in to your account</h2>
            <p className="text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-violet-600 hover:text-violet-700 font-semibold">
                Create one free
              </Link>
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 sm:p-8 border border-gray-100">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`px-4 py-3 rounded-xl text-sm ${
                    requiresVerification 
                      ? 'bg-amber-50 border border-amber-200 text-amber-700' 
                      : 'bg-red-50 border border-red-100 text-red-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {requiresVerification ? (
                      <Mail className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                    )}
                    <span>{error}</span>
                  </div>
                  
                  {requiresVerification && (
                    <div className="mt-3 space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full text-amber-700 border-amber-300 hover:bg-amber-100"
                        onClick={handleResendVerification}
                        disabled={resendLoading}
                      >
                        {resendLoading ? (
                          <>
                            <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-3 w-3" />
                            Resend verification email
                          </>
                        )}
                      </Button>
                      {resendMessage && (
                        <p className={`text-xs text-center ${resendMessage.includes('Failed') ? 'text-red-500' : 'text-green-600'}`}>
                          {resendMessage}
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-violet-500 focus:ring-violet-500 rounded-xl transition-all"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    className="h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-violet-500 focus:ring-violet-500 rounded-xl pr-12 transition-all"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 cursor-pointer">
                  Keep me signed in
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Sign In
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or continue with</span>
              </div>
            </div>

            {/* Social login */}
            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-12 rounded-xl border-gray-200 hover:bg-gray-50 font-medium"
              disabled
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
          </div>

          {/* Bottom link - Desktop */}
          <p className="hidden lg:block text-center text-sm text-gray-500 mt-8">
            <Link href="/" className="hover:text-gray-700 transition-colors">
              ← Back to homepage
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
