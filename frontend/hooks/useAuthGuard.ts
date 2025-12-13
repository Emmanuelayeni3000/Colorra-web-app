import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuthStore } from '@/store/authStore'

interface UseAuthGuardOptions {
    redirectTo?: string
    redirectIfNotAuthenticated?: boolean
}

/**
 * Hook to handle authentication with proper hydration handling.
 * Prevents premature redirects before auth state is restored from localStorage.
 * 
 * @param options.redirectTo - URL to redirect to if not authenticated (default: '/signin')
 * @param options.redirectIfNotAuthenticated - Whether to redirect if not authenticated (default: true)
 * 
 * @returns { isAuthenticated, isLoading, user } - Auth state
 */
export function useAuthGuard(options: UseAuthGuardOptions = {}) {
    const {
        redirectTo = '/signin',
        redirectIfNotAuthenticated = true
    } = options

    const router = useRouter()
    const { isAuthenticated, user, hasHydrated } = useAuthStore()

    useEffect(() => {
        if (hasHydrated && !isAuthenticated && redirectIfNotAuthenticated) {
            // Preserve the current path as a redirect parameter
            const currentPath = router.asPath
            const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`
            router.push(redirectUrl)
        }
    }, [hasHydrated, isAuthenticated, redirectIfNotAuthenticated, redirectTo, router])

    return {
        isAuthenticated,
        user,
        isLoading: !hasHydrated,
        hasHydrated
    }
}

export default useAuthGuard
