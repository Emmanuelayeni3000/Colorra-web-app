import { verifyEmailConfig, sendPasswordResetEmail } from '../services/emailService'

async function testEmailConfiguration() {
  console.log('Testing email configuration...')
  
  try {
    // Test email configuration
    const isValid = await verifyEmailConfig()
    
    if (isValid) {
      console.log('✅ Email configuration is valid')
      
      // Optionally test sending an email (uncomment and replace with your email)
      // const testEmail = 'your-test-email@example.com'
      // const testToken = 'test-token-123'
      // await sendPasswordResetEmail(testEmail, testToken)
      // console.log('✅ Test email sent successfully')
    } else {
      console.log('❌ Email configuration is invalid')
    }
  } catch (error) {
    console.error('❌ Email test failed:', error)
  }
}

// Run the test
testEmailConfiguration()
