import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuthStore } from '@/store/authStore'

interface WithAuthProps {
  children: React.ReactNode
}

export default function withAuth<T extends WithAuthProps>(WrappedComponent: React.ComponentType<T>) {
  const AuthenticatedComponent = (props: T) => {
    const { isAuthenticated } = useAuthStore()
    const router = useRouter()

    useEffect(() => {
      if (!isAuthenticated) {
        router.push('/signin')
      }
    }, [isAuthenticated, router])

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )
    }

    return <WrappedComponent {...props} />
  }

  return AuthenticatedComponent
}
