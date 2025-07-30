import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Palette, Sparkles, Heart, Download } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Palette className="h-8 w-8 text-primary" />,
      title: "Create Palettes",
      description: "Generate beautiful color palettes with our intuitive color picker tools."
    },
    {
      icon: <Sparkles className="h-8 w-8 text-primary" />,
      title: "Extract from Images",
      description: "Upload any image and automatically extract its dominant colors."
    },
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: "Save & Favorite",
      description: "Save your palettes and mark your favorites for easy access."
    },
    {
      icon: <Download className="h-8 w-8 text-primary" />,
      title: "Export & Share",
      description: "Export your palettes in various formats and share with others."
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-accent-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <img src="/images/colorra-logo.png" alt="Colorra Logo" className="h-20 w-25" />
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/signin">
                <Button variant="ghost" className="text-neutral-700 hover:bg-[#14b8a6] hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-primary hover:bg-primary-600 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-neutral-900 mb-6">
              Create Beautiful
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#14b8a6] to-primary-700 block">
                Color Palettes
              </span>
            </h1>
            <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
              Discover, create, and manage stunning color palettes with our modern web application. 
              Perfect for designers, developers, and creative professionals.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Link href="/signup">
                <Button size="lg" className="bg-primary hover:bg-primary-600 px-8 py-3 text-lg text-white">
                  Start Creating
                </Button>
              </Link>
              <Link href="/signin">
                <Button variant="outline" size="lg" className="px-8 py-3 text-lg hover:bg-[#14b8a6] hover:text-white">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              Everything you need to create
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Powerful tools and features to help you create, manage, and share beautiful color palettes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl text-neutral-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-neutral-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-neutral-900 mb-6">
            Ready to start creating?
          </h2>
          <p className="text-xl text-neutral-600 mb-8">
            Join thousands of designers and developers who trust Colorra for their color palette needs.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-primary hover:bg-primary-600 px-12 py-4 text-lg text-white">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <img src="/images/colorra-logo.png" alt="Colorra Logo" className="h-20 w-25" />
          </div>
          <p className="text-neutral-400">
            Create beautiful color palettes with ease.
          </p>
        </div>
      </footer>
    </div>
  )
}
