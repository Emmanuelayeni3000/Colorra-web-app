import React from 'react'
import Link from 'next/link'
import { motion, easeOut } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Palette as PaletteIcon, 
  Sparkles, 
  Heart, 
  Download, 
  Users, 
  ArrowRight, 
  Zap, 
  Share2,
  Eye,
  ImageIcon,
  Copy,
  Bookmark,
  Globe
} from 'lucide-react'
import { GetServerSideProps } from 'next'
import { apiClient } from '@/lib/api'
import PublicPaletteCard from '@/components/palette/PublicPaletteCard'
import { Palette } from '@/store/paletteStore'

interface HomePageProps {
  publicPalettes: Palette[];
}

export const getServerSideProps: GetServerSideProps<HomePageProps> = async () => {
  try {
    const publicPalettes = await apiClient.getPublicPalettes();
    const limitedPalettes = publicPalettes.slice(0, 6);
    return {
      props: {
        publicPalettes: limitedPalettes,
      },
    };
  } catch (error) {
    console.error('Failed to fetch public palettes for homepage:', error);
    return {
      props: {
        publicPalettes: [],
      },
    };
  }
};

export default function HomePage({ publicPalettes }: HomePageProps) {
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: easeOut }
    }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  }

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: easeOut }
    }
  }

  const mainFeatures = [
    {
      icon: <PaletteIcon className="h-6 w-6" />,
      title: "Create Stunning Palettes",
      description: "Build beautiful color combinations from scratch with our intuitive color picker and smart suggestions.",
      gradient: "from-violet-500 to-purple-600"
    },
    {
      icon: <ImageIcon className="h-6 w-6" />,
      title: "Extract From Images",
      description: "Upload any image and let our AI extract the perfect color palette in seconds.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Accessibility Tools",
      description: "Check contrast ratios and simulate color blindness to ensure your palettes work for everyone.",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      icon: <Download className="h-6 w-6" />,
      title: "Export Anywhere",
      description: "Download in CSS, SCSS, JSON, or PNG formats. Copy colors instantly to your clipboard.",
      gradient: "from-orange-500 to-amber-500"
    }
  ]

  const socialFeatures = [
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Explore Community",
      description: "Browse thousands of palettes shared by designers worldwide"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Follow Creators",
      description: "Build your personalized feed by following your favorite creators"
    },
    {
      icon: <Bookmark className="h-8 w-8" />,
      title: "Save & Organize",
      description: "Bookmark palettes you love and organize them for your projects"
    },
    {
      icon: <Copy className="h-8 w-8" />,
      title: "Remix Palettes",
      description: "Take inspiration and create your own version of any public palette"
    }
  ]

  const stats = [
    { value: "10K+", label: "Color Palettes" },
    { value: "5K+", label: "Active Creators" },
    { value: "50K+", label: "Colors Shared" }
  ]

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Image src="/images/colorra-logo.png" alt="Colorra Logo" width={100} height={80} />
            </motion.div>
            <div className="flex items-center gap-3">
              <Link href="/signin">
                <Button variant="ghost" className="text-gray-700 hover:text-gray-900 font-medium">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25 font-medium">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-cyan-50 -z-10" />
        
        {/* Animated gradient orbs */}
        <motion.div 
          className="absolute top-20 -left-32 w-96 h-96 bg-gradient-to-r from-violet-200 to-purple-200 rounded-full blur-3xl opacity-40"
          animate={{ 
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-0 -right-32 w-96 h-96 bg-gradient-to-r from-cyan-200 to-teal-200 rounded-full blur-3xl opacity-40"
          animate={{ 
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Badge */}
            <motion.div 
              variants={fadeInUp}
              className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
            >
              <Sparkles className="h-4 w-4" />
              <span>The Ultimate Color Palette Tool</span>
            </motion.div>

            {/* Main headline */}
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight"
            >
              Create, Share & Discover
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600">
                Beautiful Color Palettes
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Colorra helps designers, developers, and creatives build stunning color combinations, 
              extract colors from images, and share their work with a global community.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Link href="/signup">
                <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Button size="lg" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-6 text-lg shadow-xl shadow-violet-500/30 font-semibold">
                    Start Creating for Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link href="/explore">
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" size="lg" className="px-8 py-6 text-lg border-gray-300 hover:bg-gray-50 font-medium">
                    <Eye className="mr-2 h-5 w-5" />
                    Explore Palettes
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Hero palette preview */}
            <motion.div 
              variants={scaleIn}
              className="max-w-3xl mx-auto"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 blur-2xl rounded-3xl" />
                <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                  <div className="flex h-32">
                    {['#8B5CF6', '#A78BFA', '#14B8A6', '#2DD4BF', '#06B6D4'].map((color, i) => (
                      <motion.div
                        key={color}
                        className="flex-1 transition-all duration-300 hover:flex-[1.5]"
                        style={{ backgroundColor: color }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 + 0.5 }}
                      />
                    ))}
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">Aurora Dreams</p>
                      <p className="text-sm text-gray-500">by Colorra Team</p>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400">
                      <Heart className="h-5 w-5" />
                      <Share2 className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* What is Colorra Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            >
              What is Colorra?
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Colorra is a modern color palette platform that combines powerful creation tools 
              with a vibrant community of designers and developers.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-6"
          >
            {mainFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="h-full bg-white border-0 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-5">
                      <div className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-violet-600 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Social Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Users className="h-4 w-4" />
              <span>Community Powered</span>
            </motion.div>
            <motion.h2 
              variants={fadeInUp}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            >
              More Than Just a Tool
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-gray-600 max-w-3xl mx-auto"
            >
              Join a thriving community of color enthusiasts. Share your creations, 
              discover inspiration, and connect with fellow designers.
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          >
            {socialFeatures.map((feature, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                className="text-center p-6"
              >
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-br from-violet-100 to-cyan-100 rounded-2xl flex items-center justify-center text-violet-600 mx-auto mb-4"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="flex justify-center gap-12 md:gap-20"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-cyan-600">
                  {stat.value}
                </p>
                <p className="text-gray-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Community Palettes Preview */}
      {publicPalettes.length > 0 && (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-violet-50/30">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={staggerContainer}
              className="text-center mb-16"
            >
              <motion.h2 
                variants={fadeInUp}
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
              >
                Fresh From the Community
              </motion.h2>
              <motion.p 
                variants={fadeInUp}
                className="text-xl text-gray-600"
              >
                Explore the latest palettes shared by our creative community
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
            >
              {publicPalettes.map((palette) => (
                <motion.div key={palette.id} variants={fadeInUp}>
                  <PublicPaletteCard palette={palette} readonly={true} />
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              className="text-center"
            >
              <Link href="/explore">
                <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }} className="inline-block">
                  <Button size="lg" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-6 text-lg shadow-xl shadow-violet-500/30 font-semibold">
                    View All Palettes
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Final CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-700" />
        
        {/* Decorative elements */}
        <motion.div 
          className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2] }}
          transition={{ duration: 6, repeat: Infinity }}
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
              <Zap className="h-4 w-4" />
              <span>100% Free to Get Started</span>
            </motion.div>
            
            <motion.h2 
              variants={fadeInUp}
              className="text-4xl md:text-6xl font-bold text-white mb-6"
            >
              Ready to Find Your
              <span className="block">Perfect Colors?</span>
            </motion.h2>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-white/80 mb-10 max-w-2xl mx-auto"
            >
              Join thousands of designers and developers who use Colorra to create 
              beautiful, accessible color palettes for their projects.
            </motion.p>
            
            <motion.div variants={fadeInUp}>
              <Link href="/signup">
                <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.98 }} className="inline-block">
                  <Button size="lg" className="bg-white text-violet-700 hover:bg-gray-100 px-12 py-7 text-xl font-bold shadow-2xl">
                    Create Your First Palette
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center">
              <Image 
                src="/images/colorra-logo.png" 
                alt="Colorra Logo" 
                width={120} 
                height={40} 
                className="brightness-0 invert opacity-90"
              />
            </div>
            
            <div className="flex items-center gap-8 text-sm">
              <Link href="/explore" className="hover:text-white transition-colors">Explore</Link>
              <Link href="/signin" className="hover:text-white transition-colors">Sign In</Link>
              <Link href="/signup" className="hover:text-white transition-colors">Get Started</Link>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-sm">
                Developed with ❤️ by <span className="text-white font-medium">Emmanuel Ayeni</span>
              </p>
              <p className="text-xs mt-1 text-gray-500">
                © {new Date().getFullYear()} Colorra. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}