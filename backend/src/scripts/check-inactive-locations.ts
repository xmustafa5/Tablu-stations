import prisma from '../utils/prisma';

async function checkInactiveLocations() {
  console.log('🔍 Checking INACTIVE locations...\n');

  try {
    const inactive = await prisma.location.findMany({
      where: { isActive: false },
      include: {
        _count: {
          select: { reservations: true },
        },
      },
    });

    console.log(`Found ${inactive.length} INACTIVE locations\n`);

    if (inactive.length > 0) {
      console.log('INACTIVE Locations with reservations:');
      inactive.forEach(l => {
        console.log(`  - ${l.name}: ${l._count.reservations} reservations`);
      });

      console.log('\n⚠️  These locations have reservations but are marked as INACTIVE!');
      console.log('    They will not show in the frontend by default.\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkInactiveLocations();
