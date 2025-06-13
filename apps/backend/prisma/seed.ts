import {
  PrismaClient,
  UserStatus,
  LeadStatus,
  SubscriptionStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data in correct order (respecting foreign key constraints)
  console.log('🧹 Cleaning existing data...');
  await prisma.userCalendarSetting.deleteMany();
  await prisma.event.deleteMany();
  await prisma.calendar.deleteMany();
  await prisma.connectedAccount.deleteMany();
  await prisma.userSubscription.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();

  // Create Permissions
  console.log('📝 Creating permissions...');
  const permissions = await Promise.all([
    // User Management Permissions
    prisma.permission.create({
      data: {
        name: 'user:create',
        description: 'Create new users',
        resource: 'user',
        action: 'create',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'user:read',
        description: 'View user information',
        resource: 'user',
        action: 'read',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'user:update',
        description: 'Update user information',
        resource: 'user',
        action: 'update',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'user:delete',
        description: 'Delete users',
        resource: 'user',
        action: 'delete',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'user:manage_roles',
        description: 'Assign and remove user roles',
        resource: 'user',
        action: 'manage_roles',
      },
    }),

    // Lead Management Permissions
    prisma.permission.create({
      data: {
        name: 'lead:create',
        description: 'Create new leads',
        resource: 'lead',
        action: 'create',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'lead:read',
        description: 'View lead information',
        resource: 'lead',
        action: 'read',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'lead:update',
        description: 'Update lead information',
        resource: 'lead',
        action: 'update',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'lead:delete',
        description: 'Delete leads',
        resource: 'lead',
        action: 'delete',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'lead:convert',
        description: 'Convert leads to users',
        resource: 'lead',
        action: 'convert',
      },
    }),

    // Admin Panel Permissions
    prisma.permission.create({
      data: {
        name: 'admin:access',
        description: 'Access admin panel',
        resource: 'admin',
        action: 'access',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'admin:dashboard',
        description: 'View admin dashboard',
        resource: 'admin',
        action: 'dashboard',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'audit:read',
        description: 'View audit logs',
        resource: 'audit',
        action: 'read',
      },
    }),

    // Subscription Management Permissions
    prisma.permission.create({
      data: {
        name: 'subscription:read',
        description: 'View subscription information',
        resource: 'subscription',
        action: 'read',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'subscription:cancel',
        description: 'Cancel user subscriptions',
        resource: 'subscription',
        action: 'cancel',
      },
    }),

    // Calendar Permissions
    prisma.permission.create({
      data: {
        name: 'calendar:read',
        description: 'View calendar information',
        resource: 'calendar',
        action: 'read',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'calendar:write',
        description: 'Create and modify calendar events',
        resource: 'calendar',
        action: 'write',
      },
    }),
    prisma.permission.create({
      data: {
        name: 'calendar:connect',
        description: 'Connect external calendar accounts',
        resource: 'calendar',
        action: 'connect',
      },
    }),
  ]);

  console.log(`✅ Created ${permissions.length} permissions`);

  // Create Roles
  console.log('👥 Creating roles...');

  // Client Role - for regular users of the calendar application
  const clientRole = await prisma.role.create({
    data: {
      name: 'client',
      description: 'Regular calendar application user',
    },
  });

  // Admin Role - for admin panel users with general administrative privileges
  const adminRole = await prisma.role.create({
    data: {
      name: 'admin',
      description: 'Admin panel user with general administrative privileges',
    },
  });

  // Super Admin Role - for admin panel users with full system access
  const superAdminRole = await prisma.role.create({
    data: {
      name: 'super_admin',
      description: 'Admin panel user with full system access',
    },
  });

  // Lead Manager Role - for users who can manage leads
  const leadManagerRole = await prisma.role.create({
    data: {
      name: 'lead_manager',
      description: 'User who can manage leads and convert them to clients',
    },
  });

  console.log('✅ Created 4 roles');

  // Assign permissions to roles
  console.log('🔗 Assigning permissions to roles...');

  // Client permissions (calendar functionality)
  const clientPermissions = permissions.filter((p) =>
    p.name.startsWith('calendar:'),
  );

  for (const permission of clientPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: clientRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Admin permissions (all client permissions + admin panel access + user/lead management)
  const adminPermissions = permissions.filter(
    (p) =>
      p.name.startsWith('calendar:') ||
      p.name.startsWith('admin:') ||
      p.name.startsWith('audit:') ||
      p.name.startsWith('subscription:') ||
      (p.name.startsWith('user:') &&
        !p.name.includes('delete') &&
        !p.name.includes('manage_roles')) ||
      p.name.startsWith('lead:'),
  );

  for (const permission of adminPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Super Admin permissions (all permissions)
  for (const permission of permissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: superAdminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Lead Manager permissions (lead management + basic user read)
  const leadManagerPermissions = permissions.filter(
    (p) =>
      p.name.startsWith('lead:') ||
      p.name === 'user:read' ||
      p.name === 'admin:access',
  );

  for (const permission of leadManagerPermissions) {
    await prisma.rolePermission.create({
      data: {
        roleId: leadManagerRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log('✅ Assigned permissions to roles');

  // Create Subscription Plans
  console.log('💳 Creating subscription plans...');
  const basicPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Basic',
      description: 'Basic calendar features with limited integrations',
      price: 9.99,
      billingFrequency: 'monthly',
      features: {
        calendars: 3,
        events: 1000,
        integrations: ['google'],
        support: 'email',
      },
    },
  });

  const proPlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Pro',
      description: 'Advanced calendar features with full integrations',
      price: 19.99,
      billingFrequency: 'monthly',
      features: {
        calendars: 10,
        events: 10000,
        integrations: ['google', 'microsoft', 'apple'],
        support: 'priority',
      },
    },
  });

  const enterprisePlan = await prisma.subscriptionPlan.create({
    data: {
      name: 'Enterprise',
      description: 'Enterprise-grade features with unlimited access',
      price: 49.99,
      billingFrequency: 'monthly',
      features: {
        calendars: 'unlimited',
        events: 'unlimited',
        integrations: 'all',
        support: '24/7',
      },
    },
  });

  console.log('✅ Created 3 subscription plans');

  // Create Sample Users
  console.log('👤 Creating sample users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Super Admin User
  const superAdminUser = await prisma.user.create({
    data: {
      email: 'superadmin@unical.com',
      fullName: 'Super Administrator',
      password: hashedPassword,
      emailVerified: true,
      status: UserStatus.ACTIVE,
      registrationDate: new Date(),
      phoneNumber: '+1-555-0001',
    },
  });

  await prisma.userRole.create({
    data: {
      userId: superAdminUser.id,
      roleId: superAdminRole.id,
      assignedBy: superAdminUser.id, // self-assigned for bootstrap
    },
  });

  // Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@unical.com',
      fullName: 'System Administrator',
      password: hashedPassword,
      emailVerified: true,
      status: UserStatus.ACTIVE,
      registrationDate: new Date(),
      phoneNumber: '+1-555-0002',
    },
  });

  await prisma.userRole.create({
    data: {
      userId: adminUser.id,
      roleId: adminRole.id,
      assignedBy: superAdminUser.id,
    },
  });

  // Lead Manager User
  const leadManagerUser = await prisma.user.create({
    data: {
      email: 'leadmanager@unical.com',
      fullName: 'Lead Manager',
      password: hashedPassword,
      emailVerified: true,
      status: UserStatus.ACTIVE,
      registrationDate: new Date(),
      phoneNumber: '+1-555-0003',
    },
  });

  await prisma.userRole.create({
    data: {
      userId: leadManagerUser.id,
      roleId: leadManagerRole.id,
      assignedBy: superAdminUser.id,
    },
  });

  // Sample Client Users
  const clientUser1 = await prisma.user.create({
    data: {
      email: 'john.doe@example.com',
      fullName: 'John Doe',
      password: hashedPassword,
      emailVerified: true,
      status: UserStatus.ACTIVE,
      registrationDate: new Date(),
      phoneNumber: '+1-555-1001',
      timeZone: 'America/New_York',
    },
  });

  await prisma.userRole.create({
    data: {
      userId: clientUser1.id,
      roleId: clientRole.id,
      assignedBy: adminUser.id,
    },
  });

  const clientUser2 = await prisma.user.create({
    data: {
      email: 'jane.smith@example.com',
      fullName: 'Jane Smith',
      password: hashedPassword,
      emailVerified: true,
      status: UserStatus.ACTIVE,
      registrationDate: new Date(),
      phoneNumber: '+1-555-1002',
      timeZone: 'America/Los_Angeles',
    },
  });

  await prisma.userRole.create({
    data: {
      userId: clientUser2.id,
      roleId: clientRole.id,
      assignedBy: adminUser.id,
    },
  });

  // Create a user with multiple roles (client + lead_manager)
  const multiRoleUser = await prisma.user.create({
    data: {
      email: 'multi.role@example.com',
      fullName: 'Multi Role User',
      password: hashedPassword,
      emailVerified: true,
      status: UserStatus.ACTIVE,
      registrationDate: new Date(),
      phoneNumber: '+1-555-1003',
      timeZone: 'America/Chicago',
    },
  });

  await prisma.userRole.create({
    data: {
      userId: multiRoleUser.id,
      roleId: clientRole.id,
      assignedBy: adminUser.id,
    },
  });

  await prisma.userRole.create({
    data: {
      userId: multiRoleUser.id,
      roleId: leadManagerRole.id,
      assignedBy: superAdminUser.id,
    },
  });

  console.log('✅ Created 6 sample users');

  // Create Sample Subscriptions
  console.log('📊 Creating sample subscriptions...');
  await prisma.userSubscription.create({
    data: {
      userId: clientUser1.id,
      planId: basicPlan.id,
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date(),
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  await prisma.userSubscription.create({
    data: {
      userId: clientUser2.id,
      planId: proPlan.id,
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date(),
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.userSubscription.create({
    data: {
      userId: multiRoleUser.id,
      planId: enterprisePlan.id,
      status: SubscriptionStatus.TRIAL,
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day trial
    },
  });

  console.log('✅ Created 3 sample subscriptions');

  // Create Sample Leads
  console.log('🎯 Creating sample leads...');
  const lead1 = await prisma.lead.create({
    data: {
      fullName: 'Alice Johnson',
      email: 'alice.johnson@prospect.com',
      phoneNumber: '+1-555-2001',
      companyName: 'TechCorp Inc.',
      source: 'website_form',
      status: LeadStatus.NEW,
      notes: 'Interested in enterprise features for team of 50+',
      assignedToId: leadManagerUser.id,
    },
  });

  const lead2 = await prisma.lead.create({
    data: {
      fullName: 'Bob Wilson',
      email: 'bob.wilson@startup.com',
      phoneNumber: '+1-555-2002',
      companyName: 'StartupXYZ',
      source: 'google_ads',
      status: LeadStatus.CONTACTED,
      notes: 'Small team, budget conscious, interested in basic plan',
      assignedToId: leadManagerUser.id,
    },
  });

  await prisma.lead.create({
    data: {
      fullName: 'Carol Brown',
      email: 'carol.brown@freelancer.com',
      source: 'referral',
      status: LeadStatus.QUALIFIED,
      notes: 'Freelance consultant, needs personal calendar management',
      assignedToId: multiRoleUser.id,
    },
  });

  await prisma.lead.create({
    data: {
      fullName: 'David Miller',
      email: 'david.miller@bigcorp.com',
      phoneNumber: '+1-555-2004',
      companyName: 'BigCorp Industries',
      source: 'trade_show',
      status: LeadStatus.DISQUALIFIED,
      notes:
        'Not a good fit - they need manufacturing scheduling, not calendar management',
    },
  });

  console.log('✅ Created 4 sample leads');

  // Create Sample Audit Logs
  console.log('📋 Creating sample audit logs...');
  await prisma.auditLog.create({
    data: {
      performingUserId: superAdminUser.id,
      action: 'user_created',
      entityType: 'User',
      affectedUserId: adminUser.id,
      details: {
        roles: ['admin'],
        email: adminUser.email,
        status: 'active',
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Admin Panel)',
    },
  });

  await prisma.auditLog.create({
    data: {
      performingUserId: adminUser.id,
      action: 'user_role_assigned',
      entityType: 'User',
      affectedUserId: clientUser1.id,
      details: {
        role_added: 'client',
        previous_roles: [],
        new_roles: ['client'],
      },
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Admin Panel)',
    },
  });

  await prisma.auditLog.create({
    data: {
      performingUserId: leadManagerUser.id,
      action: 'lead_created',
      entityType: 'Lead',
      affectedLeadId: lead1.id,
      details: {
        source: lead1.source,
        status: lead1.status,
        company: lead1.companyName,
      },
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Admin Panel)',
    },
  });

  await prisma.auditLog.create({
    data: {
      performingUserId: leadManagerUser.id,
      action: 'lead_status_updated',
      entityType: 'Lead',
      affectedLeadId: lead2.id,
      details: {
        previous_status: 'NEW',
        new_status: 'CONTACTED',
        notes: 'Initial contact made via email',
      },
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (Admin Panel)',
    },
  });

  console.log('✅ Created 4 sample audit logs');

  console.log('🎉 Database seeding completed successfully!');

  // Print summary
  console.log('\n📊 Seeding Summary:');
  console.log(`   • ${permissions.length} permissions created`);
  console.log(
    `   • 4 roles created (client, admin, super_admin, lead_manager)`,
  );
  console.log(`   • 3 subscription plans created`);
  console.log(
    `   • 6 users created (including admin users with different roles)`,
  );
  console.log(`   • 3 subscriptions created`);
  console.log(`   • 4 leads created`);
  console.log(`   • 4 audit log entries created`);
  console.log('\n🔑 Test Credentials:');
  console.log('   Super Admin: superadmin@unical.com / password123');
  console.log('   Admin: admin@unical.com / password123');
  console.log('   Lead Manager: leadmanager@unical.com / password123');
  console.log(
    '   Client Users: john.doe@example.com, jane.smith@example.com / password123',
  );
  console.log('   Multi-role User: multi.role@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
