import type { AppProps } from 'next/app'
import { Inter, DM_Sans } from 'next/font/google'
import ToastProvider from '@/components/providers/ToastProvider'
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
  return (
    <div className={`${inter.variable} ${dmSans.variable} font-sans`}>
      <Component {...pageProps} />
      <ToastProvider />
    </div>
  )
}
