import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setPaletteOfTheDay() {
  try {
    // 1. Get all public palettes
    const publicPalettes = await prisma.palette.findMany({
      where: {
        isPublic: true,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (publicPalettes.length === 0) {
      console.log('No public palettes found to set as Palette of the Day.');
      return;
    }

    // 2. Select a random public palette
    const randomIndex = Math.floor(Math.random() * publicPalettes.length);
    const selectedPalette = publicPalettes[randomIndex];

    // 3. Set all palettes' isPaletteOfTheDay to false
    await prisma.palette.updateMany({
      where: {
        isPaletteOfTheDay: true,
      },
      data: {
        isPaletteOfTheDay: false,
      },
    });

    // 4. Set the selected palette's isPaletteOfTheDay to true
    await prisma.palette.update({
      where: {
        id: selectedPalette.id,
      },
      data: {
        isPaletteOfTheDay: true,
      },
    });

    console.log(`Successfully set "${selectedPalette.name}" (ID: ${selectedPalette.id}) as Palette of the Day.`);
  } catch (error) {
    console.error('Error setting Palette of the Day:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setPaletteOfTheDay();