import type { AppProps } from 'next/app'
import { Inter, DM_Sans } from 'next/font/google'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Toaster } from 'sonner'
import '../styles/globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
})

export default function App({ Component, pageProps }: AppProps) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className={`${inter.variable} ${dmSans.variable} font-sans`}>
        <Component {...pageProps} />
        <Toaster
          position="top-center"
          toastOptions={{
            classNames: {
              actionButton: 'bg-[#14b8a6] text-white',
            },
          }}
        />
      </div>
    </GoogleOAuthProvider>
  )
}
