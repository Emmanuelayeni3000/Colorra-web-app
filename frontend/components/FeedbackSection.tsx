'use client'

import React, { useState, useRef } from 'react'
import { motion, easeOut } from 'framer-motion'
import emailjs from '@emailjs/browser'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Sparkles 
} from 'lucide-react'

// EmailJS Configuration - Replace these with your actual EmailJS credentials
const EMAILJS_SERVICE_ID = 'service_a3oqr2s'  // Replace with your EmailJS Service ID
const EMAILJS_TEMPLATE_ID = 'template_j0bgckx' // Replace with your EmailJS Template ID
const EMAILJS_PUBLIC_KEY = 'i6ZVYbZnrtPn6HxLW'   // Replace with your EmailJS Public Key

interface FeedbackFormData {
  from_name: string
  from_email: string
  message: string
}

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error'

export default function FeedbackSection() {
  const formRef = useRef<HTMLFormElement>(null)
  const [formData, setFormData] = useState<FeedbackFormData>({
    from_name: '',
    from_email: '',
    message: ''
  })
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitStatus('loading')
    setErrorMessage('')

    // Basic validation
    if (!formData.from_name.trim() || !formData.from_email.trim() || !formData.message.trim()) {
      setSubmitStatus('error')
      setErrorMessage('Please fill in all fields')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.from_email)) {
      setSubmitStatus('error')
      setErrorMessage('Please enter a valid email address')
      return
    }

    try {
      await emailjs.sendForm(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        formRef.current!,
        EMAILJS_PUBLIC_KEY
      )

      setSubmitStatus('success')
      setFormData({ from_name: '', from_email: '', message: '' })
      
      // Reset to idle after 5 seconds
      setTimeout(() => setSubmitStatus('idle'), 5000)
    } catch (error) {
      console.error('EmailJS Error:', error)
      setSubmitStatus('error')
      setErrorMessage('Failed to send feedback. Please try again later.')
    }
  }

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

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-violet-50 -z-10" />
      
      {/* Animated gradient orbs */}
      <motion.div 
        className="absolute top-10 -right-20 w-80 h-80 bg-gradient-to-r from-teal-200 to-cyan-200 rounded-full blur-3xl opacity-40"
        animate={{ 
          x: [0, -30, 0],
          y: [0, 20, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-10 -left-20 w-80 h-80 bg-gradient-to-r from-violet-200 to-purple-200 rounded-full blur-3xl opacity-40"
        animate={{ 
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.div 
            variants={fadeInUp}
            className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
          >
            <MessageSquare className="h-4 w-4" />
            <span>We Value Your Feedback</span>
          </motion.div>
          
          <motion.h2 
            variants={fadeInUp}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Help Us Improve Colorra
          </motion.h2>
          
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Share your thoughts, suggestions, or ideas for new features. 
            Your feedback helps us make Colorra even better!
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeInUp}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl shadow-gray-200/50">
            <CardContent className="p-8 md:p-10">
              {submitStatus === 'success' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                  <p className="text-gray-600">
                    Your feedback has been sent successfully. We appreciate your input!
                  </p>
                </motion.div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="from_name" className="text-sm font-medium text-gray-700">
                        Your Name
                      </label>
                      <Input
                        id="from_name"
                        name="from_name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.from_name}
                        onChange={handleChange}
                        className="bg-white/70 border-gray-200 focus:border-teal-500 focus:ring-teal-500 h-12"
                        disabled={submitStatus === 'loading'}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="from_email" className="text-sm font-medium text-gray-700">
                        Your Email
                      </label>
                      <Input
                        id="from_email"
                        name="from_email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.from_email}
                        onChange={handleChange}
                        className="bg-white/70 border-gray-200 focus:border-teal-500 focus:ring-teal-500 h-12"
                        disabled={submitStatus === 'loading'}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-gray-700">
                      Your Feedback
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      placeholder="Tell us what you think about Colorra, what features you'd like to see, or any suggestions for improvement..."
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/70 border border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all duration-200 resize-none text-gray-900 placeholder:text-gray-400"
                      disabled={submitStatus === 'loading'}
                    />
                  </div>

                  {submitStatus === 'error' && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg"
                    >
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm">{errorMessage}</span>
                    </motion.div>
                  )}

                  <div className="flex justify-center pt-2">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        size="lg"
                        disabled={submitStatus === 'loading'}
                        className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-10 py-6 text-lg font-semibold shadow-lg shadow-teal-500/30 disabled:opacity-70"
                      >
                        {submitStatus === 'loading' ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-5 w-5" />
                            Send Feedback
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>

                  <p className="text-center text-sm text-gray-500 mt-4">
                    <Sparkles className="inline h-4 w-4 mr-1 text-teal-500" />
                    Your feedback helps shape the future of Colorra
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
