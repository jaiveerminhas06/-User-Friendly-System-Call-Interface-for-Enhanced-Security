import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@syscall.local' },
    update: {},
    create: {
      email: 'admin@syscall.local',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('✅ Created admin user');

  // Create power user
  const powerPassword = await bcrypt.hash('power123', 12);
  const powerUser = await prisma.user.upsert({
    where: { email: 'power@syscall.local' },
    update: {},
    create: {
      email: 'power@syscall.local',
      name: 'Power User',
      password: powerPassword,
      role: 'POWER_USER',
      isActive: true,
    },
  });
  console.log('✅ Created power user');

  // Create viewer
  const viewerPassword = await bcrypt.hash('viewer123', 12);
  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@syscall.local' },
    update: {},
    create: {
      email: 'viewer@syscall.local',
      name: 'Viewer User',
      password: viewerPassword,
      role: 'VIEWER',
      isActive: true,
    },
  });
  console.log('✅ Created viewer user');

  // Initialize system calls
  const systemCalls = [
    {
      name: 'listDirectory',
      description: 'List contents of a directory',
      category: 'FILE_SYSTEM',
      allowedRoles: JSON.stringify(['ADMIN', 'POWER_USER', 'VIEWER']),
      requiresParams: true,
      enabled: true,
    },
    {
      name: 'readFile',
      description: 'Read contents of a file',
      category: 'FILE_SYSTEM',
      allowedRoles: JSON.stringify(['ADMIN', 'POWER_USER', 'VIEWER']),
      requiresParams: true,
      enabled: true,
    },
    {
      name: 'writeFile',
      description: 'Write data to a file',
      category: 'FILE_SYSTEM',
      allowedRoles: JSON.stringify(['ADMIN', 'POWER_USER']),
      requiresParams: true,
      enabled: true,
    },
    {
      name: 'deleteFile',
      description: 'Delete a file',
      category: 'FILE_SYSTEM',
      allowedRoles: JSON.stringify(['ADMIN']),
      requiresParams: true,
      enabled: true,
    },
    {
      name: 'getSystemInfo',
      description: 'Get system information (CPU, memory, OS)',
      category: 'SYSTEM_INFO',
      allowedRoles: JSON.stringify(['ADMIN', 'POWER_USER', 'VIEWER']),
      requiresParams: false,
      enabled: true,
    },
    {
      name: 'listProcesses',
      description: 'List running processes',
      category: 'PROCESS',
      allowedRoles: JSON.stringify(['ADMIN', 'POWER_USER']),
      requiresParams: false,
      enabled: true,
    },
    {
      name: 'runSafeCommand',
      description: 'Run a whitelisted system command',
      category: 'PROCESS',
      allowedRoles: JSON.stringify(['ADMIN']),
      requiresParams: true,
      enabled: true,
    },
  ];

  for (const syscall of systemCalls) {
    await prisma.systemCall.upsert({
      where: { name: syscall.name },
      update: syscall,
      create: syscall,
    });
  }
  console.log('✅ Created system calls');

  // Create some default policies
  const allSystemCalls = await prisma.systemCall.findMany();
  
  for (const syscall of allSystemCalls) {
    const allowedRoles = JSON.parse(syscall.allowedRoles);
    
    for (const role of allowedRoles) {
      await prisma.policy.upsert({
        where: {
          role_systemCallId: {
            role: role as any,
            systemCallId: syscall.id,
          },
        },
        update: {},
        create: {
          role: role as any,
          systemCallId: syscall.id,
          allowed: true,
          maxExecutions: role === 'VIEWER' ? 10 : null, // Rate limit viewers
        },
      });
    }
  }
  console.log('✅ Created default policies');

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('📝 Default credentials:');
  console.log('   Admin:      admin@syscall.local / admin123');
  console.log('   Power User: power@syscall.local / power123');
  console.log('   Viewer:     viewer@syscall.local / viewer123\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
