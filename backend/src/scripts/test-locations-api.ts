import prisma from '../utils/prisma';

async function testLocationsAPI() {
  console.log('🧪 Testing Locations API Data\n');

  try {
    // Simulate what the API returns
    const locations = await prisma.location.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { reservations: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    console.log(`📊 Total ACTIVE locations: ${locations.length}\n`);
    console.log('Location Name | Reservations Count');
    console.log('----------------------------------------');

    locations.forEach((location) => {
      console.log(`${location.name.padEnd(30)} | ${location._count.reservations}`);
    });

    console.log('\n');

    const withReservations = locations.filter(l => l._count.reservations > 0);
    const withoutReservations = locations.filter(l => l._count.reservations === 0);

    console.log(`✅ Locations WITH reservations: ${withReservations.length}`);
    console.log(`❌ Locations WITHOUT reservations: ${withoutReservations.length}`);

    console.log('\n📍 Locations with reservations:');
    withReservations.forEach(l => {
      console.log(`   - ${l.name} (${l._count.reservations} reservation${l._count.reservations > 1 ? 's' : ''})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLocationsAPI();
