import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import { apiClient } from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await apiClient.forgotPassword({ email })
      setIsSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-[#8b5cf6]/5 to-[#14b8a6]/5 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <Link href="/" className="flex items-center justify-center space-x-2">
              <img src="/images/colorra-logo.png" alt="Colorra Logo" className="h-20 w-25" />
            </Link>
            <h2 className="text-2xl font-bold text-neutral-900">Check your email</h2>
          </div>

          {/* Success Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-neutral-900">Email sent!</CardTitle>
              <CardDescription className="text-neutral-600">
                We've sent a password reset link to <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-sm text-neutral-600">
                <p>Check your email and click the link to reset your password.</p>
                <p className="mt-2">Didn't receive the email? Check your spam folder.</p>
              </div>
              
              <div className="flex flex-col space-y-3">
                <Button
                  onClick={() => {
                    setIsSuccess(false)
                    setEmail('')
                  }}
                  variant="outline"
                  className="w-full hover:bg-[#8b5cf6] hover:text-white"
                >
                  Send another email
                </Button>
                
                <Link href="/signin">
                  <Button
                    className="w-full bg-[#14b8a6] text-white hover:bg-[#0f766e]"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-[#8b5cf6]/5 to-[#14b8a6]/5 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center space-x-2">
            <img src="/images/colorra-logo.png" alt="Colorra Logo" className="h-20 w-25" />
          </Link>
          <h2 className="text-2xl font-bold text-neutral-900">Forgot your password?</h2>
          <p className="mt-2 text-neutral-600">
            No worries! Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Forgot Password Form */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-neutral-900">Reset Password</CardTitle>
            <CardDescription className="text-center text-neutral-600">
              Enter your email address to receive a reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-neutral-700">
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="bg-white/50 pl-10"
                  />
                  <Mail className="h-4 w-4 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <Button
                  type="submit"
                  className="w-full bg-[#14b8a6] text-white hover:bg-[#0f766e]"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
                
                <Link href="/signin">
                  <Button
                    variant="outline"
                    className="w-full hover:bg-[#8b5cf6] hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Sign In
                  </Button>
                </Link>
              </div>

              <div className="text-center text-sm text-neutral-600">
                Remember your password?{' '}
                <Link href="/signin" className="text-[#8b5cf6] hover:text-[#7c3aed] font-medium">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
