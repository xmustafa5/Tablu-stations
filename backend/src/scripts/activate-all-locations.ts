import prisma from '../utils/prisma';

async function activateAllLocations() {
  console.log('🔧 Activating all locations...\n');

  try {
    const result = await prisma.location.updateMany({
      where: { isActive: false },
      data: { isActive: true },
    });

    console.log(`✅ Activated ${result.count} locations\n`);

    // Verify
    const allLocations = await prisma.location.findMany({
      include: {
        _count: {
          select: { reservations: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    console.log('All locations are now ACTIVE:\n');
    allLocations.forEach(l => {
      console.log(`  - ${l.name}: ${l._count.reservations} reservations (${l.isActive ? '✅ ACTIVE' : '❌ INACTIVE'})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

activateAllLocations();
