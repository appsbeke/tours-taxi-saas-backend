import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';

export async function seedDatabase(dataSource: DataSource) {
  console.log('🌱 Starting database seed...');

  const userRepository = dataSource.getRepository(User);
  const roleRepository = dataSource.getRepository(Role);

  // Create roles if they don't exist
  const roleNames = ['super_admin', 'admin', 'customer', 'driver', 'guide'];
  const roles: Role[] = [];

  for (const roleName of roleNames) {
    let role = await roleRepository.findOne({ where: { name: roleName } });
    if (!role) {
      role = roleRepository.create({
        name: roleName,
        description: `${roleName.charAt(0).toUpperCase() + roleName.slice(1)} role`,
      });
      await roleRepository.save(role);
      console.log(`✅ Created role: ${roleName}`);
    }
    roles.push(role);
  }

  // Create default super admin user
  const adminPhone = '+1234567890';
  let adminUser = await userRepository.findOne({
    where: { phone: adminPhone },
    relations: ['roles'],
  });

  if (!adminUser) {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const superAdminRole = roles.find(r => r.name === 'super_admin');

    adminUser = userRepository.create({
      phone: adminPhone,
      email: 'admin@toursandtaxi.com',
      passwordHash: hashedPassword,
      status: 'active',
      emailVerifiedAt: new Date(),
      phoneVerifiedAt: new Date(),
      roles: [superAdminRole],
    });

    await userRepository.save(adminUser);
    console.log('✅ Created default super admin user');
    console.log('   Phone: +1234567890');
    console.log('   Password: Admin@123');
  } else {
    console.log('ℹ️  Super admin user already exists');
  }

  console.log('🎉 Database seed completed!');
}
