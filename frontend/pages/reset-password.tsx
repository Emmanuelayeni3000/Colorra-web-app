import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Lock, CheckCircle } from 'lucide-react'
import { apiClient } from '@/lib/api'

export default function ResetPasswordPage() {
  const router = useRouter()
  const { token } = router.query
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (!token) {
      setError('Invalid or missing reset token')
      return
    }
    
    setIsLoading(true)

    try {
      await apiClient.resetPassword({ token: token as string, password })
      setIsSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-[#8b5cf6]/5 to-[#14b8a6]/5 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link href="/" className="flex items-center justify-center space-x-2">
              <img src="/images/colorra-logo.png" alt="Colorra Logo" className="h-20 w-25" />
            </Link>
            <h2 className="text-2xl font-bold text-neutral-900">Password Reset Successful</h2>
          </div>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-neutral-900">Success!</CardTitle>
              <CardDescription className="text-neutral-600">
                Your password has been reset. You can now sign in with your new password.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/signin">
                <Button className="w-full bg-[#14b8a6] text-white hover:bg-[#0f766e]">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-[#8b5cf6]/5 to-[#14b8a6]/5 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="flex items-center justify-center space-x-2">
            <img src="/images/colorra-logo.png" alt="Colorra Logo" className="h-20 w-25" />
          </Link>
          <h2 className="text-2xl font-bold text-neutral-900">Reset your password</h2>
          <p className="mt-2 text-neutral-600">
            Enter your new password below.
          </p>
        </div>
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-neutral-900">Set New Password</CardTitle>
            <CardDescription className="text-center text-neutral-600">
              Your new password must be at least 6 characters long.
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
                <label htmlFor="password" className="text-sm font-medium text-neutral-700">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    className="bg-white/50 pl-10"
                  />
                  <Lock className="h-4 w-4 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>
              <div className="space-y-2 mb-6">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-neutral-700">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    className="bg-white/50 pl-10"
                  />
                  <Lock className="h-4 w-4 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-[#14b8a6] text-white hover:bg-[#0f766e] mt-4"
                disabled={isLoading}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
              <Link href="/signin">
                <Button
                  variant="outline"
                  className="w-full mt-2 hover:bg-[#8b5cf6] hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Sign In
                </Button>
              </Link>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
