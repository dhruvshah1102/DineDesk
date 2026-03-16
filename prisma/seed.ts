import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // 1. Create Platform Admin
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.platformAdmin.upsert({
    where: { email: 'admin@menuflow.com' },
    update: {},
    create: {
      email: 'admin@menuflow.com',
      passwordHash: adminPasswordHash,
      role: 'super_admin',
    },
  });
  console.log('Platform Admin created:', admin.email);

  // 2. Create Demo tenant (The Brew House)
  const ownerPasswordHash = await bcrypt.hash('Owner@123', 10);
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'brew-house' },
    update: {},
    create: {
      name: 'The Brew House',
      slug: 'brew-house',
      email: 'owner@brewhouse.com',
      passwordHash: ownerPasswordHash,
      phone: '+91 98765 43210',
      address: '12 MG Road, Bengaluru',
      primaryColor: '#C8853A',
      numTables: 6,
      plan: 'pro',
    },
  });
  console.log('Tenant created:', tenant.name);

  // 3. Create Categories
  const categoryCoffee = await prisma.category.create({
    data: { tenantId: tenant.id, name: 'Coffee', sortOrder: 1 },
  });
  const categoryFood = await prisma.category.create({
    data: { tenantId: tenant.id, name: 'Food', sortOrder: 2 },
  });
  const categoryColdDrinks = await prisma.category.create({
    data: { tenantId: tenant.id, name: 'Cold Drinks', sortOrder: 3 },
  });
  console.log('Categories created');

  // 4. Create Menu Items
  const menuItemsToCreate = [
    // Coffee
    { tenantId: tenant.id, categoryId: categoryCoffee.id, name: 'Flat White', price: 180, isVeg: true, isAvailable: true },
    { tenantId: tenant.id, categoryId: categoryCoffee.id, name: 'Cappuccino', price: 160, isVeg: true, isAvailable: true },
    { tenantId: tenant.id, categoryId: categoryCoffee.id, name: 'Cold Brew', price: 220, isVeg: true, isAvailable: true },
    { tenantId: tenant.id, categoryId: categoryCoffee.id, name: 'Matcha Latte', price: 200, isVeg: true, isAvailable: true },
    // Food
    { tenantId: tenant.id, categoryId: categoryFood.id, name: 'Avocado Toast', price: 280, isVeg: true, isAvailable: true },
    { tenantId: tenant.id, categoryId: categoryFood.id, name: 'Banana Bread', price: 140, isVeg: true, isAvailable: true },
    { tenantId: tenant.id, categoryId: categoryFood.id, name: 'Croissant', price: 120, isVeg: false, isAvailable: true },
    { tenantId: tenant.id, categoryId: categoryFood.id, name: 'Granola Bowl', price: 240, isVeg: true, isAvailable: false }, // Sold out
    // Cold Drinks
    { tenantId: tenant.id, categoryId: categoryColdDrinks.id, name: 'Fresh Lime Soda', price: 120, isVeg: true, isAvailable: true },
    { tenantId: tenant.id, categoryId: categoryColdDrinks.id, name: 'Watermelon Juice', price: 150, isVeg: true, isAvailable: true },
    { tenantId: tenant.id, categoryId: categoryColdDrinks.id, name: 'Iced Tea', price: 130, isVeg: true, isAvailable: true },
  ];

  await prisma.menuItem.createMany({ data: menuItemsToCreate });
  console.log('Menu items created');

  // 5. Create Tables
  const tables = Array.from({ length: 6 }).map((_, i) => ({
    tenantId: tenant.id,
    tableNumber: i + 1,
    isActive: true,
  }));
  
  await prisma.cafeTable.createMany({ data: tables });
  console.log('Tables created');

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
