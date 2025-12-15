import Head from 'next/head'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string
  canonical?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'profile'
  noIndex?: boolean
}

const SITE_URL = 'https://colorra.eacalledsolutions.org'
const DEFAULT_TITLE = 'Colorra - Create Beautiful Color Palettes'
const DEFAULT_DESCRIPTION = 'Create, organize, and share stunning color palettes for your creative projects. Discover inspiration from our community and build your perfect color schemes.'
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/colorra-logo.png`
const DEFAULT_KEYWORDS = 'color palette, color scheme, design tools, color picker, creative tools, color generator, palette creator, design inspiration, color combinations, UI design colors'

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  noIndex = false
}: SEOProps) {
  const fullTitle = title ? `${title} | Colorra` : DEFAULT_TITLE
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : SITE_URL

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Colorra" />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={ogType} />

      {/* Twitter */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:url" content={canonicalUrl} />
    </Head>
  )
}

// Page-specific SEO configurations
export const pageSEO = {
  home: {
    title: undefined, // Uses default
    description: 'Create, organize, and share stunning color palettes for your creative projects. Discover inspiration from our community and build your perfect color schemes.',
    canonical: '/'
  },
  dashboard: {
    title: 'Dashboard',
    description: 'Manage your color palettes, view favorites, and create new beautiful color schemes in your personal dashboard.',
    canonical: '/dashboard'
  },
  explore: {
    title: 'Explore Palettes',
    description: 'Discover stunning color palettes created by our creative community. Filter by categories like Warm, Cool, Pastel, and more.',
    canonical: '/explore'
  },
  favorites: {
    title: 'Favorites',
    description: 'Access your favorite color palettes quickly. All your most-loved color schemes in one place.',
    canonical: '/favorites'
  },
  saved: {
    title: 'Saved Palettes',
    description: 'View your bookmarked color palettes from the Colorra community. Your curated collection of inspiring color schemes.',
    canonical: '/saved'
  },
  shared: {
    title: 'Shared Palettes',
    description: 'View color palettes that have been shared with you by other Colorra users.',
    canonical: '/shared'
  },
  activity: {
    title: 'Activity Feed',
    description: 'Stay updated with your latest activity, notifications, and community interactions on Colorra.',
    canonical: '/activity'
  },
  profile: {
    title: 'Profile',
    description: 'Manage your Colorra profile, update your settings, and view your public palettes.',
    canonical: '/profile'
  },
  signin: {
    title: 'Sign In',
    description: 'Sign in to your Colorra account to access your color palettes and join our creative community.',
    canonical: '/signin',
    noIndex: true
  },
  signup: {
    title: 'Create Account',
    description: 'Join Colorra today and start creating beautiful color palettes. Free to sign up!',
    canonical: '/signup'
  },
  forgotPassword: {
    title: 'Reset Password',
    description: 'Reset your Colorra account password securely.',
    canonical: '/forgot-password',
    noIndex: true
  },
  verifyEmail: {
    title: 'Verify Email',
    description: 'Verify your email address to complete your Colorra account setup.',
    canonical: '/verify-email',
    noIndex: true
  }
}
