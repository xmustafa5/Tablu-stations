import prisma from '../utils/prisma';

async function migrateLocations() {
  console.log('🚀 Starting location migration...');

  try {
    // Step 1: Get all unique locations from existing reservations
    const uniqueLocations = await prisma.$queryRaw<{ location: string }[]>`
      SELECT DISTINCT location
      FROM reservations
      WHERE location IS NOT NULL AND location != ''
    `;

    console.log(`📍 Found ${uniqueLocations.length} unique locations`);

    // Step 2: Create Location records for each unique location
    for (const { location } of uniqueLocations) {
      try {
        const created = await prisma.location.upsert({
          where: { name: location },
          update: {},
          create: {
            name: location,
            description: `Auto-migrated from existing reservations`,
            isActive: true,
          },
        });
        console.log(`✅ Created/found location: ${created.name} (${created.id})`);
      } catch (error: any) {
        console.log(`⚠️  Location ${location} already exists or error:`, error.message);
      }
    }

    // Step 3: Update all reservations to link to the new Location records
    const reservations = await prisma.reservation.findMany({
      where: {
        location: { not: null },
        locationId: null,
      },
    });

    console.log(`🔄 Updating ${reservations.length} reservations...`);

    let updated = 0;
    for (const reservation of reservations) {
      if (reservation.location) {
        const location = await prisma.location.findUnique({
          where: { name: reservation.location },
        });

        if (location) {
          await prisma.reservation.update({
            where: { id: reservation.id },
            data: { locationId: location.id },
          });
          updated++;
        }
      }
    }

    console.log(`✅ Updated ${updated} reservations with location references`);

    // Step 4: Verify migration
    const reservationsWithLocation = await prisma.reservation.count({
      where: { locationId: { not: null } },
    });

    const totalReservations = await prisma.reservation.count();

    console.log(`\n📊 Migration Summary:`);
    console.log(`   Total reservations: ${totalReservations}`);
    console.log(`   Reservations with location: ${reservationsWithLocation}`);
    console.log(`   Total locations: ${uniqueLocations.length}`);

    console.log('\n✅ Location migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateLocations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
