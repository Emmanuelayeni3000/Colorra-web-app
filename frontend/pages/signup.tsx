import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { Eye, EyeOff, ArrowRight, Check, Palette, Sparkles, Users, Download, Mail, RefreshCw } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { apiClient } from '@/lib/api'
import { AxiosError } from 'axios'

export default function SignUpPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [verificationSent, setVerificationSent] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setError('')
    setIsLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${apiUrl}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      })

      const data = await response.json()

      if (response.ok) {
        login(data.user, data.token)
        router.push('/dashboard')
      } else {
        setError(data.message || 'Google sign-up failed. Please try again.')
      }
    } catch (err) {
      console.error('Google sign-up error:', err)
      setError('Google sign-up failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('Google sign-up was cancelled or failed. Please try again.')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setIsLoading(true)

    try {
      const data = await apiClient.signUp({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })
      
      // Check if email verification is required
      if (data.requiresVerification) {
        setRegisteredEmail(formData.email)
        setVerificationSent(true)
      } else {
        // Fallback for when verification is not required (legacy behavior)
        router.push('/signin')
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Failed to create account');
      } else {
        setError('Failed to create account');
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setResendLoading(true)
    setResendMessage('')
    try {
      const response = await apiClient.resendVerificationEmail(registeredEmail)
      setResendMessage(response.message || 'Verification email sent!')
    } catch {
      setResendMessage('Failed to resend. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '' }
    if (password.length < 6) return { strength: 1, label: 'Too short' }
    if (password.length < 8) return { strength: 2, label: 'Weak' }
    if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/)) return { strength: 4, label: 'Strong' }
    return { strength: 3, label: 'Good' }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  const features = [
    { icon: <Palette className="h-5 w-5" />, text: "Create unlimited color palettes" },
    { icon: <Sparkles className="h-5 w-5" />, text: "Extract colors from any image" },
    { icon: <Users className="h-5 w-5" />, text: "Join our creative community" },
    { icon: <Download className="h-5 w-5" />, text: "Export in multiple formats" },
  ]

  // Show verification sent screen
  if (verificationSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full"
        >
          <div className="text-center mb-8">
            <Link href="/">
              <Image src="/images/colorra-logo.png" alt="Colorra Logo" width={120} height={40} className="mx-auto" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="h-10 w-10 text-teal-600" />
              </div>
            </motion.div>

            <h1 className="text-2xl font-bold text-gray-900 mb-4">Check your email!</h1>
            <p className="text-gray-600 mb-2">
              We&apos;ve sent a verification link to:
            </p>
            <p className="font-semibold text-gray-900 mb-6">{registeredEmail}</p>
            <p className="text-sm text-gray-500 mb-8">
              Click the link in the email to verify your account and start creating beautiful color palettes.
            </p>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl"
                onClick={handleResendVerification}
                disabled={resendLoading}
              >
                {resendLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend verification email
                  </>
                )}
              </Button>
              
              {resendMessage && (
                <p className={`text-sm ${resendMessage.includes('Failed') ? 'text-red-500' : 'text-green-600'}`}>
                  {resendMessage}
                </p>
              )}

              <Link href="/signin" className="block">
                <Button variant="ghost" className="w-full">
                  Already verified? Sign in
                </Button>
              </Link>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            Didn&apos;t receive the email? Check your spam folder.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-600 relative overflow-hidden">
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
          className="absolute bottom-20 -right-20 w-96 h-96 bg-violet-400/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            y: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/3 right-1/4 w-48 h-48 bg-yellow-400/10 rounded-full blur-2xl"
          animate={{ 
            rotate: [0, 360],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
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
              Start creating beautiful palettes today
            </h1>
            <p className="text-lg text-white/80 mb-12 max-w-md">
              Join thousands of designers and developers who use Colorra to bring their color visions to life.
            </p>

            {/* Features list */}
            <div className="space-y-4">
              <p className="text-sm font-medium text-white/60 uppercase tracking-wider">What you&apos;ll get</p>
              <div className="space-y-3">
                {features.map((feature, idx) => (
                  <motion.div 
                    key={idx}
                    className="flex items-center gap-3 text-white"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                  >
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <span className="text-white/90">{feature.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Trust indicator */}
            <motion.div 
              className="mt-12 pt-8 border-t border-white/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-sm text-white/60">Trusted by 5,000+ creatives worldwide</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Sign Up Form */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-teal-50 to-gray-50 lg:bg-gray-50 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 min-h-screen lg:min-h-0 overflow-y-auto">
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
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/signin" className="text-teal-600 hover:text-teal-700 font-semibold">
                Sign in
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
                  className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2"
                >
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  {error}
                </motion.div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  className="h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-teal-500 focus:ring-teal-500 rounded-xl transition-all"
                />
              </div>

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
                  className="h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-teal-500 focus:ring-teal-500 rounded-xl transition-all"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a strong password"
                    required
                    className="h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-teal-500 focus:ring-teal-500 rounded-xl pr-12 transition-all"
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
                {/* Password strength indicator */}
                {formData.password && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full rounded-full ${
                          passwordStrength.strength === 1 ? 'bg-red-500' :
                          passwordStrength.strength === 2 ? 'bg-orange-500' :
                          passwordStrength.strength === 3 ? 'bg-yellow-500' :
                          passwordStrength.strength === 4 ? 'bg-green-500' : ''
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${passwordStrength.strength * 25}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength.strength === 1 ? 'text-red-500' :
                      passwordStrength.strength === 2 ? 'text-orange-500' :
                      passwordStrength.strength === 3 ? 'text-yellow-600' :
                      passwordStrength.strength === 4 ? 'text-green-500' : ''
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                    className="h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-teal-500 focus:ring-teal-500 rounded-xl pr-12 transition-all"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {/* Password match indicator */}
                {formData.confirmPassword && (
                  <div className="flex items-center gap-1.5 mt-1">
                    {formData.password === formData.confirmPassword ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-green-500 font-medium">Passwords match</span>
                      </>
                    ) : (
                      <span className="text-xs text-red-500 font-medium">Passwords don&apos;t match</span>
                    )}
                  </div>
                )}
              </div>

              {/* Terms */}
              <p className="text-xs text-gray-500 text-center">
                By creating an account, you agree to our{' '}
                <Link href="#" className="text-teal-600 hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="#" className="text-teal-600 hover:underline">Privacy Policy</Link>
              </p>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-teal-500/25 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Create Account
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
                <span className="px-4 bg-white text-gray-500">or sign up with</span>
              </div>
            </div>

            {/* Google Sign-Up */}
            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                width={350}
                text="signup_with"
                shape="rectangular"
              />
            </div>
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
