import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  X,
  ChevronRight,
  ChevronLeft,
  Home,
  Heart,
  Star,
  Users,
  Bell,
  User,
  Compass,
  Sparkles,
  CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface OnboardingTutorialProps {
  onComplete: () => void
  onSkip: () => void
}

const tutorialSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Colorra! 🎨',
    description: 'Your personal color palette workspace. Let\'s take a quick tour to help you get started.',
    icon: Sparkles,
    iconColor: 'text-purple-500',
    bgGradient: 'from-purple-500/10 to-pink-500/10',
    content: (
      <div className="space-y-4">
        <p className="text-neutral-600">
          Colorra helps you create, organize, and share beautiful color palettes for your creative projects.
        </p>
        <div className="flex items-center justify-center gap-3 py-4">
          {['#8b5cf6', '#ec4899', '#14b8a6', '#fbbf24', '#6366f1'].map((color) => (
            <div
              key={color}
              className="w-10 h-10 rounded-xl shadow-lg Ring-2 ring-white/80 transition-transform hover:scale-110"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    )
  },
  {
    id: 'sidebar',
    title: 'Your Navigation Hub 📍',
    description: 'The sidebar is your main navigation. Here\'s what each section does:',
    icon: Home,
    iconColor: 'text-teal-500',
    bgGradient: 'from-teal-500/10 to-cyan-500/10',
    content: (
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50/50 hover:bg-purple-50 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <Home className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-neutral-800 text-sm">Dashboard</p>
            <p className="text-xs text-neutral-500">View and manage all your palettes</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-pink-50/50 hover:bg-pink-50 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
            <Heart className="h-4 w-4 text-pink-600" />
          </div>
          <div>
            <p className="font-medium text-neutral-800 text-sm">Favorites</p>
            <p className="text-xs text-neutral-500">Quick access to your favorite palettes</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/50 hover:bg-amber-50 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
            <Star className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="font-medium text-neutral-800 text-sm">Saved Palettes</p>
            <p className="text-xs text-neutral-500">Palettes you&apos;ve bookmarked from explore</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/50 hover:bg-blue-50 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-neutral-800 text-sm">Shared Palettes</p>
            <p className="text-xs text-neutral-500">Palettes shared with you by others</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-50/50 hover:bg-violet-50 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
            <Bell className="h-4 w-4 text-violet-600" />
          </div>
          <div>
            <p className="font-medium text-neutral-800 text-sm">Activity</p>
            <p className="text-xs text-neutral-500">View your notifications and activity feed</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/50 hover:bg-emerald-50 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <User className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="font-medium text-neutral-800 text-sm">Profile</p>
            <p className="text-xs text-neutral-500">Manage your account and settings</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'explore',
    title: 'Discover Amazing Palettes 🌟',
    description: 'The Explore button opens up a world of color inspiration!',
    icon: Compass,
    iconColor: 'text-pink-500',
    bgGradient: 'from-pink-500/10 to-orange-500/10',
    content: (
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-teal-700">Explore Palettes</span>
          </div>
          <ul className="space-y-2 text-sm text-neutral-600">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-teal-500" />
              <span>Browse public palettes from the community</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-teal-500" />
              <span>Filter by categories like Warm, Cool, Pastel</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-teal-500" />
              <span>Bookmark palettes to save for later</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-teal-500" />
              <span>See the featured Palette of the Day</span>
            </li>
          </ul>
        </div>
        <p className="text-sm text-neutral-500 text-center">
          💡 Pro tip: Make your palettes public to share with the community!
        </p>
      </div>
    )
  }
]

export default function OnboardingTutorial({ onComplete, onSkip }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const step = tutorialSteps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === tutorialSteps.length - 1

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const Icon = step.icon

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="relative w-full max-w-lg bg-white shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Close/Skip button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors"
          aria-label="Skip tutorial"
        >
          <X className="h-4 w-4 text-neutral-600" />
        </button>

        {/* Header with gradient */}
        <div className={cn('p-6 pb-4 bg-gradient-to-br', step.bgGradient)}>
          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-4">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  index === currentStep
                    ? 'w-8 bg-gradient-to-r from-purple-500 to-pink-500'
                    : index < currentStep
                    ? 'w-4 bg-purple-300'
                    : 'w-4 bg-neutral-200'
                )}
              />
            ))}
            <span className="ml-auto text-xs text-neutral-500">
              {currentStep + 1} of {tutorialSteps.length}
            </span>
          </div>

          {/* Icon and title */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/80 shadow-sm flex items-center justify-center">
              <Icon className={cn('h-6 w-6', step.iconColor)} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-900">{step.title}</h2>
            </div>
          </div>
          <p className="text-neutral-600 text-sm">{step.description}</p>
        </div>

        {/* Content */}
        <CardContent className="p-6 pt-4 max-h-[50vh] overflow-y-auto">
          {step.content}
        </CardContent>

        {/* Footer with navigation */}
        <div className="p-4 pt-0 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="text-neutral-600 hover:text-neutral-900 disabled:opacity-0"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            className="btn-gradient-teal text-white rounded-xl shadow-lg shadow-teal-500/20 px-6"
          >
            {isLastStep ? (
              <>
                Get Started
                <Sparkles className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  )
}
