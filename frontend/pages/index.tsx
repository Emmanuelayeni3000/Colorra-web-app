import React from 'react'
import Link from 'next/link'
import { motion, easeOut, easeInOut } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Palette, Sparkles, Heart, Download, Users, Star, Workflow, ArrowRight, Zap, Brush, Share2 } from 'lucide-react'

export default function HomePage() {
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
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
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: easeOut }
    }
  }

  const slideInLeft = {
    hidden: { opacity: 0, x: -60 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: easeOut }
    }
  }

  const slideInRight = {
    hidden: { opacity: 0, x: 60 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: easeOut }
    }
  }

  // Hook for scroll-triggered animations
  const useScrollAnimation = () => {
    const [ref, inView] = useInView({
      threshold: 0.1,
      triggerOnce: true
    })
    return [ref, inView]
  }

  const features = [
    {
      icon: <Palette className="h-8 w-8 text-primary" />,
      title: "Create Palettes",
      description: "Generate beautiful color palettes with our intuitive color picker tools.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Sparkles className="h-8 w-8 text-primary" />,
      title: "Extract from Images",
      description: "Upload any image and automatically extract its dominant colors.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: "Save & Favorite",
      description: "Save your palettes and mark your favorites for easy access.",
      color: "from-red-500 to-orange-500"
    },
    {
      icon: <Download className="h-8 w-8 text-primary" />,
      title: "Export & Share",
      description: "Export your palettes in various formats and share with others.",
      color: "from-green-500 to-teal-500"
    }
  ]

  const testimonials = [
    {
      quote: "Colorra has transformed how I approach design projects. The palette generator is a game-changer!",
      author: "Sarah M., UI Designer",
      rating: 5
    },
    {
      quote: "Extracting colors from images is so seamless. It saves me hours of work!",
      author: "James T., Web Developer",
      rating: 4
    },
    {
      quote: "The ability to save and share palettes makes collaboration so much easier.",
      author: "Emma L., Graphic Artist",
      rating: 5
    }
  ]

  const steps = [
    {
      icon: <Brush className="h-8 w-8 text-primary" />,
      title: "Pick or Upload",
      description: "Choose colors manually or upload an image to extract colors.",
      step: "01"
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Customize",
      description: "Fine-tune your palette with our advanced editing tools.",
      step: "02"
    },
    {
      icon: <Share2 className="h-8 w-8 text-primary" />,
      title: "Export",
      description: "Download your palette in multiple formats or share it online.",
      step: "03"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-accent-50 overflow-hidden">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <img src="/images/colorra-logo.png" alt="Colorra Logo" className="h-20 w-25" />
            </motion.div>
            <div className="flex items-center space-x-4">
              <Link href="/signin">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="ghost" className="text-neutral-700 hover:bg-[#8b5cf6] hover:text-white transition-all duration-300">
                    Sign In
                  </Button>
                </motion.div>
              </Link>
              <Link href="/signup">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="bg-[#14b8a6] hover:bg-[#0f766e] text-white shadow-lg hover:shadow-xl transition-all duration-300">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        {/* Floating background elements */}
        <motion.div 
          className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 blur-xl"
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-20 blur-xl"
          animate={{ 
            y: [0, 20, 0],
            rotate: [360, 180, 0]
          }}
          transition={{ 
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 left-1/4 w-24 h-24 bg-gradient-to-r from-green-400 to-teal-400 rounded-full opacity-20 blur-xl"
          animate={{ 
            x: [0, 30, 0],
            y: [0, -10, 0]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold text-neutral-900 mb-6"
            >
              Create Beautiful
              <motion.span 
                className="text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] via-[#14b8a6] to-[#8b5cf6] block"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{ backgroundSize: "200% 200%" }}
              >
                Color Palettes
              </motion.span>
            </motion.h1>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto"
            >
              Discover, create, and manage stunning color palettes with our modern web application. 
              Perfect for designers, developers, and creative professionals.
            </motion.p>
            <motion.div 
              variants={fadeInUp}
              className="flex items-center justify-center space-x-4"
            >
              <Link href="/signup">
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" className="bg-[#14b8a6] hover:bg-[#0f766e] px-8 py-3 text-lg text-white shadow-2xl hover:shadow-3xl transition-all duration-300">
                    Start Creating
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </motion.div>
                  </Button>
                </motion.div>
              </Link>
              <Link href="/signin">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="outline" size="lg" className="px-8 py-3 text-lg hover:bg-[#8b5cf6] hover:text-white border-2 hover:border-[#8b5cf6] transition-all duration-300">
                    Sign In
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 relative">
        <motion.div 
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-primary/5 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-4xl font-bold text-neutral-900 mb-4"
            >
              Everything you need to create
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-neutral-600 max-w-2xl mx-auto"
            >
              Powerful tools and features to help you create, manage, and share beautiful color palettes.
            </motion.p>
          </motion.div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            style={{ perspective: 1000 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={scaleIn}
                whileHover={{ 
                  y: -10,
                  rotateY: 5,
                  scale: 1.05
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="text-center p-6 hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm relative overflow-hidden group">
                  {/* Animated gradient background */}
                  <motion.div 
                    className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                    initial={{ scale: 0, rotate: 0 }}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  />
                  <CardHeader className="pb-4 relative z-10">
                    <motion.div 
                      className="flex justify-center mb-4"
                      whileHover={{ 
                        scale: 1.2,
                        rotate: 360
                      }}
                      transition={{ duration: 0.6 }}
                    >
                      <div className="p-3 bg-primary/10 rounded-full">
                        {feature.icon}
                      </div>
                    </motion.div>
                    <CardTitle className="text-xl text-neutral-900">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="text-neutral-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-accent-50 relative overflow-hidden">
        {/* Animated background shapes */}
        <motion.div 
          className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div 
          className="absolute -bottom-10 -right-10 w-60 h-60 bg-accent/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4]
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={slideInLeft}
              className="text-4xl font-bold text-neutral-900 mb-4"
            >
              Loved by Creatives Worldwide
            </motion.h2>
            <motion.p 
              variants={slideInRight}
              className="text-xl text-neutral-600 max-w-2xl mx-auto"
            >
              See what designers and developers are saying about Colorra.
            </motion.p>
          </motion.div>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ 
                  y: -5,
                  scale: 1.03,
                  rotateX: 5
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="p-6 hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm relative overflow-hidden group">
                  <motion.div 
                    className="absolute inset-2 bg-gradient-to-br from-[#8b5cf6]/5 to-[#14b8a6]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
                    initial={{ scale: 0.8 }}
                    whileHover={{ scale: 1.0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <CardContent className="relative z-10 p-2">
                    <motion.div 
                      className="flex justify-center mb-4"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 + i * 0.1 }}
                        >
                          <Star className="h-5 w-5 text-primary fill-current" />
                        </motion.div>
                      ))}
                    </motion.div>
                    <p className="text-neutral-600 mb-4 italic">"{testimonial.quote}"</p>
                    <p className="text-neutral-900 font-semibold">{testimonial.author}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 relative">
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
              className="text-4xl font-bold text-neutral-900 mb-4"
            >
              How Colorra Works
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-neutral-600 max-w-2xl mx-auto"
            >
              Create stunning palettes in just a few simple steps.
            </motion.p>
          </motion.div>
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8 relative"
            style={{ perspective: 1000 }}
          >
            {/* Connection lines */}
            <div className="hidden md:block absolute top-1/2 left-1/3 w-1/3 h-0.5 bg-gradient-to-r from-primary/30 to-primary/60 transform -translate-y-1/2 z-0"></div>
            <div className="hidden md:block absolute top-1/2 right-1/3 w-1/3 h-0.5 bg-gradient-to-r from-primary/60 to-primary/30 transform -translate-y-1/2 z-0"></div>
            
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 50, scale: 0.8 },
                  visible: { 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: { 
                      duration: 0.6, 
                      delay: index * 0.2,
                      type: "spring",
                      stiffness: 100
                    }
                  }
                }}
                whileHover={{ 
                  y: -10,
                  scale: 1.05,
                  rotateY: 10
                }}
                className="relative z-10"
              >
                <Card className="text-center p-8 hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm relative overflow-hidden group">
                  {/* Step number background */}
                  <motion.div 
                    className="absolute -top-4 -right-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center"
                    initial={{ rotate: 0, scale: 0 }}
                    whileInView={{ rotate: 360, scale: 1 }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                  >
                    <span className="text-2xl font-bold text-primary">{step.step}</span>
                  </motion.div>
                  
                  {/* Animated gradient overlay */}
                  <motion.div 
                    className="absolute inset-2 bg-gradient-to-br from-white/40 via-white/20 to-white/10 opacity-0 group-hover:opacity-100 rounded-lg"
                    initial={{ scale: 0.98, rotate: 0 }}
                    whileHover={{ scale: 1.0, rotate: 0.5 }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  <CardHeader className="pb-6 relative z-10">
                    <motion.div 
                      className="flex justify-center mb-6"
                      whileHover={{ 
                        scale: 1.3,
                        rotate: [0, -5, 5, 0]
                      }}
                      transition={{ duration: 0.6 }}
                    >
                      <div className="p-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl">
                        {step.icon}
                      </div>
                    </motion.div>
                    <CardTitle className="text-xl text-neutral-900 mb-2">
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="text-neutral-600 text-base">
                      {step.description}
                    </CardDescription>
                  </CardContent>
                  
                  {/* Animated border */}
                  <motion.div 
                    className="absolute inset-0 rounded-lg border-2 border-transparent bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 opacity-0 group-hover:opacity-100"
                    style={{
                      background: "linear-gradient(45deg, transparent, transparent), linear-gradient(45deg, #14b8a6, #ffffff)",
                      backgroundClip: "padding-box, border-box",
                      backgroundOrigin: "padding-box, border-box"
                    }}
                    animate={{ 
                      backgroundPosition: ["0% 0%", "100% 100%"]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-accent-50 to-primary-50 relative overflow-hidden">
        {/* Animated background particles */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full"
          animate={{ 
            scale: [0, 1, 0],
            opacity: [0, 1, 0]
          }}
          transition={{ duration: 2, repeat: Infinity, delay: 0 }}
        />
        <motion.div 
          className="absolute top-3/4 right-1/4 w-2 h-2 bg-accent rounded-full"
          animate={{ 
            scale: [0, 1, 0],
            opacity: [0, 1, 0]
          }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        />
        <motion.div 
          className="absolute top-1/2 left-3/4 w-2 h-2 bg-primary rounded-full"
          animate={{ 
            scale: [0, 1, 0],
            opacity: [0, 1, 0]
          }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={staggerContainer}
          >
            <motion.div
              variants={scaleIn}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
            </motion.div>
            <motion.h2 
              variants={fadeInUp}
              className="text-4xl font-bold text-neutral-900 mb-6"
            >
              Join Our Creative Community
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto"
            >
              Connect with thousands of designers, share your palettes, and get inspired by others' creations.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Link href="/signup">
                <motion.div
                  whileHover={{ 
                    scale: 1.05, 
                    y: -5
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Button size="lg" className="bg-[#8b5cf6] hover:bg-[#7c3aed] px-8 py-3 text-lg text-white shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"
                    />
                    <span className="relative z-10">Join Now</span>
                    <motion.div
                      className="relative z-10"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Users className="ml-2 h-5 w-5" />
                    </motion.div>
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative">
        {/* Animated gradient background */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6]/5 via-white to-[#14b8a6]/5"
          animate={{ 
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ backgroundSize: "400% 400%" }}
        />
        
        {/* Decorative elements */}
        <motion.div 
          className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-r from-[#8b5cf6]/10 to-[#14b8a6]/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-r from-[#14b8a6]/10 to-[#8b5cf6]/10 rounded-full blur-2xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        
        <div className="max-w-5xl mx-auto text-center relative z-10 px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={staggerContainer}
            className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/20"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-5xl md:text-6xl font-bold text-neutral-900 mb-8"
            >
              Ready to start{' '}
              <motion.span 
                className="text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] to-[#14b8a6]"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{ backgroundSize: "200% 200%" }}
              >
                creating?
              </motion.span>
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-xl text-neutral-600 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Join thousands of designers and developers who trust Colorra for their color palette needs. 
              Create, share, and discover beautiful color combinations that bring your projects to life.
            </motion.p>
            <motion.div variants={fadeInUp}>
              <Link href="/signup">
                <motion.div
                  whileHover={{ 
                    scale: 1.05, 
                    y: -8
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Button size="lg" className="bg-gradient-to-r from-[#8b5cf6] to-[#14b8a6] hover:from-[#7c3aed] hover:to-[#0f766e] px-16 py-6 text-xl text-white shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden rounded-full">
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    <span className="relative z-10 font-semibold">Get Started Free</span>
                    <motion.div
                      className="relative z-10"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="ml-3 h-6 w-6" />
                    </motion.div>
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-neutral-900 text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      >
        {/* Animated background gradient */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-accent/20"
          animate={{ 
            backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"]
          }}
          transition={{ 
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ backgroundSize: "200% 100%" }}
        />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div 
            className="flex items-center justify-center space-x-2 mb-4"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <img src="/images/colorra-logo.png" alt="Colorra Logo" className="h-20 w-25" />
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-neutral-400 mb-4"
          >
            Create beautiful color palettes with ease.
          </motion.p>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-neutral-400"
          >
            Developed by{' '}
            <motion.a
              href="https://eawebcraft.com.ng"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              Eawebcraft
            </motion.a>
          </motion.p>
        </div>
      </motion.footer>
    </div>
  )
}