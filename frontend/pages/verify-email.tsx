import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { AxiosError } from 'axios'

type VerificationStatus = 'loading' | 'success' | 'error' | 'no-token'

export default function VerifyEmailPage() {
  const router = useRouter()
  const { token } = router.query
  const [status, setStatus] = useState<VerificationStatus>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!router.isReady) return

    if (!token || typeof token !== 'string') {
      setStatus('no-token')
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await apiClient.verifyEmail(token)
        setStatus('success')
        setMessage(response.message || 'Email verified successfully!')
      } catch (err: unknown) {
        setStatus('error')
        if (err instanceof AxiosError) {
          setMessage(err.response?.data?.message || 'Verification failed. The link may be invalid or expired.')
        } else {
          setMessage('Verification failed. Please try again.')
        }
      }
    }

    verifyEmail()
  }, [router.isReady, token])

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-teal-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <Image src="/images/colorra-logo.png" alt="Colorra Logo" width={120} height={40} className="mx-auto" />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100 text-center">
          {status === 'loading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="h-8 w-8 text-violet-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Verifying your email...</h1>
              <p className="text-gray-600">Please wait while we confirm your email address.</p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Email Verified!</h1>
              <p className="text-gray-600">{message}</p>
              <p className="text-gray-500 text-sm">You can now sign in to your account and start creating beautiful color palettes.</p>
              <Link href="/signin">
                <Button className="w-full h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 mt-4">
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Verification Failed</h1>
              <p className="text-gray-600">{message}</p>
              <p className="text-gray-500 text-sm">The verification link may have expired or already been used.</p>
              <div className="space-y-3 mt-4">
                <Link href="/signin">
                  <Button variant="outline" className="w-full h-12 rounded-xl">
                    Go to Sign In
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}

          {status === 'no-token' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-amber-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">No Verification Token</h1>
              <p className="text-gray-600">Please use the link sent to your email to verify your account.</p>
              <p className="text-gray-500 text-sm">Can&apos;t find the email? Check your spam folder or request a new verification email.</p>
              <Link href="/signin">
                <Button variant="outline" className="w-full h-12 rounded-xl mt-4">
                  Go to Sign In
                </Button>
              </Link>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-8">
          <Link href="/" className="hover:text-gray-700 transition-colors">
            ← Back to homepage
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
