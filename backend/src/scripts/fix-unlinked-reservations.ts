import prisma from '../utils/prisma';

async function fixUnlinkedReservations() {
  console.log('🔧 Fixing unlinked reservations...\n');

  try {
    // Find reservations without locationId
    const unlinked = await prisma.reservation.findMany({
      where: { locationId: null },
      select: {
        id: true,
        location: true,
        advertiserName: true,
      },
    });

    console.log(`Found ${unlinked.length} unlinked reservations\n`);

    for (const reservation of unlinked) {
      console.log(`Processing: ${reservation.advertiserName} (location: ${reservation.location})`);

      if (reservation.location) {
        // Try to find matching location
        const matchingLocation = await prisma.location.findFirst({
          where: {
            name: {
              equals: reservation.location,
              mode: 'insensitive',
            },
          },
        });

        if (matchingLocation) {
          // Link the reservation to the location
          await prisma.reservation.update({
            where: { id: reservation.id },
            data: { locationId: matchingLocation.id },
          });
          console.log(`  ✅ Linked to location: ${matchingLocation.name} (${matchingLocation.id})`);
        } else {
          // Create new location if it doesn't exist
          const newLocation = await prisma.location.create({
            data: {
              name: reservation.location,
              description: 'Auto-created from unlinked reservation',
              isActive: true,
            },
          });

          await prisma.reservation.update({
            where: { id: reservation.id },
            data: { locationId: newLocation.id },
          });

          console.log(`  ✅ Created new location and linked: ${newLocation.name} (${newLocation.id})`);
        }
      }
      console.log('');
    }

    console.log('✅ All reservations are now linked!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUnlinkedReservations();
