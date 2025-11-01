import { PrismaClient, Role, ReservationStatus } from '../src/generated/prisma';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('🗑️  Clearing existing data...');
  await prisma.reservation.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Existing data cleared');

  // Hash password for users
  const hashedAdminPassword = await bcrypt.hash('Password123', 10);
  const hashedUserPassword = await bcrypt.hash('password123', 10);

  // Create Admin User
  console.log('👤 Creating admin user...');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedAdminPassword,
      name: 'Admin User',
      role: Role.ADMIN,
    },
  });
  console.log(`✅ Admin user created: ${adminUser.email}`);

  // Create Regular Users
  console.log('👥 Creating regular users...');
  const regularUser1 = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: hashedUserPassword,
      name: 'John Doe',
      role: Role.USER,
    },
  });
  console.log(`✅ Regular user created: ${regularUser1.email}`);

  const regularUser2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      password: hashedUserPassword,
      name: 'Jane Smith',
      role: Role.USER,
    },
  });
  console.log(`✅ Regular user created: ${regularUser2.email}`);

  // Create Sample Reservations
  console.log('📅 Creating sample reservations...');

  // Waiting reservation
  await prisma.reservation.create({
    data: {
      advertiserName: 'Tech Corp',
      customerName: 'ABC Company',
      location: 'Downtown Station A',
      startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      status: ReservationStatus.WAITING,
      userId: adminUser.id,
    },
  });

  // Active reservation
  await prisma.reservation.create({
    data: {
      advertiserName: 'Fashion Brand',
      customerName: 'XYZ Retail',
      location: 'Central Station B',
      startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      status: ReservationStatus.ACTIVE,
      userId: regularUser1.id,
    },
  });

  // Ending soon reservation
  await prisma.reservation.create({
    data: {
      advertiserName: 'Food & Beverage Co',
      customerName: 'Restaurant Group',
      location: 'North Station C',
      startTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      status: ReservationStatus.ENDING_SOON,
      userId: regularUser1.id,
    },
  });

  // Completed reservation
  await prisma.reservation.create({
    data: {
      advertiserName: 'Sports Equipment',
      customerName: 'Athletics Inc',
      location: 'South Station D',
      startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      status: ReservationStatus.COMPLETED,
      userId: regularUser2.id,
    },
  });

  // Additional reservations for regularUser2
  await prisma.reservation.create({
    data: {
      advertiserName: 'Electronics Ltd',
      customerName: 'Gadget Store',
      location: 'East Station E',
      startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      status: ReservationStatus.WAITING,
      userId: regularUser2.id,
    },
  });

  console.log('✅ Sample reservations created');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log('-----------------------------------');
  console.log('Admin User:');
  console.log('  Email: admin@example.com');
  console.log('  Password: Password123');
  console.log('  Role: ADMIN');
  console.log('\nRegular Users:');
  console.log('  1. Email: user@example.com');
  console.log('     Password: password123');
  console.log('     Name: John Doe');
  console.log('  2. Email: jane@example.com');
  console.log('     Password: password123');
  console.log('     Name: Jane Smith');
  console.log('\nReservations: 5 sample reservations created');
  console.log('-----------------------------------\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
