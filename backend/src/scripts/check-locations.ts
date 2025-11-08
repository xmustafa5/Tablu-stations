import prisma from '../utils/prisma';

async function checkLocations() {
  console.log('🔍 Checking locations and reservations...\n');

  try {
    // Get all locations with reservation counts
    const locations = await prisma.location.findMany({
      include: {
        _count: {
          select: { reservations: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    console.log(`📍 Total locations: ${locations.length}\n`);

    locations.forEach((location) => {
      console.log(`Location: ${location.name}`);
      console.log(`  ID: ${location.id}`);
      console.log(`  Reservations: ${location._count.reservations}`);
      console.log(`  Created: ${location.createdAt}`);
      console.log('');
    });

    // Check reservations with location links
    const reservations = await prisma.reservation.findMany({
      select: {
        id: true,
        location: true,
        locationId: true,
        advertiserName: true,
      },
    });

    console.log(`\n📋 Total reservations: ${reservations.length}\n`);

    reservations.forEach((res) => {
      console.log(`Reservation: ${res.advertiserName}`);
      console.log(`  Old location field: ${res.location}`);
      console.log(`  New locationId: ${res.locationId || 'NOT SET'}`);
      console.log('');
    });

    // Check if there are reservations without locationId
    const unlinkedReservations = await prisma.reservation.count({
      where: { locationId: null },
    });

    if (unlinkedReservations > 0) {
      console.log(`⚠️  WARNING: ${unlinkedReservations} reservations are not linked to locations!\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLocations();
