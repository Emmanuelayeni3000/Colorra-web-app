import type { AppProps } from 'next/app'
import { Inter, DM_Sans } from 'next/font/google'
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
  return (
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
  )
}
