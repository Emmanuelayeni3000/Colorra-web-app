const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testPrismaModels() {
  try {
    console.log('Testing Prisma client models...')
    
    // Test if models exist
    console.log('paletteShare model exists:', typeof prisma.paletteShare !== 'undefined')
    console.log('collection model exists:', typeof prisma.collection !== 'undefined')
    console.log('collectionPalette model exists:', typeof prisma.collectionPalette !== 'undefined')
    
    // Test basic operations (without actually creating data)
    const paletteShareModel = prisma.paletteShare
    const collectionModel = prisma.collection
    const collectionPaletteModel = prisma.collectionPalette
    
    console.log('Models are accessible!')
    
  } catch (error) {
    console.error('Error testing Prisma models:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPrismaModels()
