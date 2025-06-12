import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (in dependency order)
  console.log('🧹 Clearing existing data...');
  await prisma.userCalendarSetting.deleteMany();
  await prisma.event.deleteMany();
  await prisma.calendar.deleteMany();
  await prisma.connectedAccount.deleteMany();
  await prisma.user.deleteMany();

  // Create sample users
  console.log('👤 Creating users...');
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'canh@gmail.com',
        displayName: 'Canh',
        password:
          '$2b$10$8K1p/a0dR1LXMIgoEDFrwOc6P7d2MkyX5UqJxP5V8Qz3KJ5Y5Y5Y5', // Hashed version of 'Seta@2025'
        avatarUrl:
          'https://ui-avatars.com/api/?name=Canh&background=0ea5e9&color=fff',
        timeZone: 'UTC',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'john.doe@example.com',
        displayName: 'John Doe',
        avatarUrl:
          'https://ui-avatars.com/api/?name=John+Doe&background=0ea5e9&color=fff',
        timeZone: 'America/New_York',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'jane.smith@example.com',
        displayName: 'Jane Smith',
        avatarUrl:
          'https://ui-avatars.com/api/?name=Jane+Smith&background=f59e0b&color=fff',
        timeZone: 'America/Los_Angeles',
        emailVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'demo@unical.app',
        displayName: 'Demo User',
        avatarUrl:
          'https://ui-avatars.com/api/?name=Demo+User&background=10b981&color=fff',
        timeZone: 'UTC',
        emailVerified: true,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create sample connected accounts
  console.log('🔗 Creating connected accounts...');
  const connectedAccounts = await Promise.all([
    prisma.connectedAccount.create({
      data: {
        userId: users[0].id,
        provider: 'GOOGLE',
        providerAccountId: 'google_123456789',
        encryptedAccessToken: 'encrypted_google_access_token_john',
        encryptedRefreshToken: 'encrypted_google_refresh_token_john',
        tokenExpiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour from now
        scope: 'https://www.googleapis.com/auth/calendar',
      },
    }),
    prisma.connectedAccount.create({
      data: {
        userId: users[1].id,
        provider: 'OUTLOOK',
        providerAccountId: 'outlook_987654321',
        encryptedAccessToken: 'encrypted_outlook_access_token_jane',
        encryptedRefreshToken: 'encrypted_outlook_refresh_token_jane',
        tokenExpiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour from now
        scope: 'https://graph.microsoft.com/calendars.readwrite',
      },
    }),
    prisma.connectedAccount.create({
      data: {
        userId: users[2].id,
        provider: 'GOOGLE',
        providerAccountId: 'google_demo_account',
        encryptedAccessToken: 'encrypted_google_access_token_demo',
        encryptedRefreshToken: 'encrypted_google_refresh_token_demo',
        tokenExpiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour from now
        scope: 'https://www.googleapis.com/auth/calendar',
      },
    }),
  ]);

  console.log(`✅ Created ${connectedAccounts.length} connected accounts`);

  // Create sample calendars
  console.log('📅 Creating calendars...');
  const calendars = await Promise.all([
    // John Doe's calendars
    prisma.calendar.create({
      data: {
        externalId: 'primary_john',
        name: 'Personal',
        description: "John's personal calendar",
        color: '#1976D2',
        timeZone: 'America/New_York',
        isDefault: true,
        isVisible: true,
        connectedAccountId: connectedAccounts[0].id,
        userId: users[0].id,
      },
    }),
    prisma.calendar.create({
      data: {
        externalId: 'work_john',
        name: 'Work',
        description: "John's work calendar",
        color: '#D32F2F',
        timeZone: 'America/New_York',
        isDefault: false,
        isVisible: true,
        connectedAccountId: connectedAccounts[0].id,
        userId: users[0].id,
      },
    }),
    // Jane Smith's calendars
    prisma.calendar.create({
      data: {
        externalId: 'primary_jane',
        name: 'Main Calendar',
        description: "Jane's main calendar",
        color: '#F57C00',
        timeZone: 'America/Los_Angeles',
        isDefault: true,
        isVisible: true,
        connectedAccountId: connectedAccounts[1].id,
        userId: users[1].id,
      },
    }),
    prisma.calendar.create({
      data: {
        externalId: 'family_jane',
        name: 'Family',
        description: "Jane's family calendar",
        color: '#388E3C',
        timeZone: 'America/Los_Angeles',
        isDefault: false,
        isVisible: true,
        connectedAccountId: connectedAccounts[1].id,
        userId: users[1].id,
      },
    }),
    // Demo user's calendar
    prisma.calendar.create({
      data: {
        externalId: 'demo_primary',
        name: 'Demo Calendar',
        description: 'Demo calendar for testing',
        color: '#7B1FA2',
        timeZone: 'UTC',
        isDefault: true,
        isVisible: true,
        connectedAccountId: connectedAccounts[2].id,
        userId: users[2].id,
      },
    }),
  ]);

  console.log(`✅ Created ${calendars.length} calendars`);

  // Create sample events
  console.log('📝 Creating events...');
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const events = await Promise.all([
    // Today's events
    prisma.event.create({
      data: {
        externalId: 'event_john_1',
        title: 'Team Standup',
        description: 'Daily team standup meeting',
        startTime: new Date(today.getTime() + 9 * 60 * 60 * 1000), // 9 AM today
        endTime: new Date(today.getTime() + 9.5 * 60 * 60 * 1000), // 9:30 AM today
        isAllDay: false,
        location: 'Conference Room A',
        status: 'confirmed',
        visibility: 'default',
        calendarId: calendars[1].id, // John's work calendar
        userId: users[0].id,
      },
    }),
    prisma.event.create({
      data: {
        externalId: 'event_john_2',
        title: 'Lunch with Sarah',
        description: 'Catching up over lunch',
        startTime: new Date(today.getTime() + 12 * 60 * 60 * 1000), // 12 PM today
        endTime: new Date(today.getTime() + 13 * 60 * 60 * 1000), // 1 PM today
        isAllDay: false,
        location: 'Downtown Cafe',
        status: 'confirmed',
        visibility: 'default',
        calendarId: calendars[0].id, // John's personal calendar
        userId: users[0].id,
      },
    }),
    // Tomorrow's events
    prisma.event.create({
      data: {
        externalId: 'event_jane_1',
        title: 'Doctor Appointment',
        description: 'Annual checkup',
        startTime: new Date(
          today.getTime() + 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000,
        ), // 10 AM tomorrow
        endTime: new Date(
          today.getTime() + 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000,
        ), // 11 AM tomorrow
        isAllDay: false,
        location: 'Medical Center',
        status: 'confirmed',
        visibility: 'private',
        calendarId: calendars[2].id, // Jane's main calendar
        userId: users[1].id,
      },
    }),
    prisma.event.create({
      data: {
        externalId: 'event_jane_2',
        title: 'Kids Soccer Game',
        description: "Emma's soccer game",
        startTime: new Date(
          today.getTime() + 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000,
        ), // 3 PM tomorrow
        endTime: new Date(
          today.getTime() + 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000,
        ), // 5 PM tomorrow
        isAllDay: false,
        location: 'City Park Soccer Field',
        status: 'confirmed',
        visibility: 'default',
        calendarId: calendars[3].id, // Jane's family calendar
        userId: users[1].id,
      },
    }),
    // All-day event
    prisma.event.create({
      data: {
        externalId: 'event_demo_1',
        title: 'Holiday',
        description: 'National Holiday',
        startTime: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        endTime: new Date(
          today.getTime() + 7 * 24 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000,
        ), // 8 days from now
        isAllDay: true,
        status: 'confirmed',
        visibility: 'public',
        calendarId: calendars[4].id, // Demo calendar
        userId: users[2].id,
      },
    }),
    // Recurring event
    prisma.event.create({
      data: {
        externalId: 'event_john_recurring',
        title: 'Weekly Team Meeting',
        description: 'Weekly team sync',
        startTime: new Date(
          today.getTime() + 2 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000,
        ), // 2 PM in 2 days
        endTime: new Date(
          today.getTime() + 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000,
        ), // 3 PM in 2 days
        isAllDay: false,
        location: 'Virtual - Zoom',
        status: 'confirmed',
        visibility: 'default',
        recurrenceRule: 'FREQ=WEEKLY;BYDAY=FR',
        calendarId: calendars[1].id, // John's work calendar
        userId: users[0].id,
      },
    }),
    // Past event
    prisma.event.create({
      data: {
        externalId: 'event_demo_past',
        title: 'Project Kickoff',
        description: 'New project kickoff meeting',
        startTime: new Date(
          today.getTime() - 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000,
        ), // 10 AM 3 days ago
        endTime: new Date(
          today.getTime() - 3 * 24 * 60 * 60 * 1000 + 11.5 * 60 * 60 * 1000,
        ), // 11:30 AM 3 days ago
        isAllDay: false,
        location: 'Conference Room B',
        status: 'confirmed',
        visibility: 'default',
        calendarId: calendars[4].id, // Demo calendar
        userId: users[2].id,
      },
    }),
  ]);

  console.log(`✅ Created ${events.length} events`);

  // Create user calendar settings
  console.log('⚙️  Creating user calendar settings...');
  const settings = await Promise.all([
    // Settings for each user-calendar combination
    prisma.userCalendarSetting.create({
      data: {
        userId: users[0].id,
        calendarId: calendars[0].id, // John's personal calendar
        syncEnabled: true,
        conflictResolution: 'manual',
        notificationsEnabled: true,
        defaultEventDuration: 60, // 1 hour
      },
    }),
    prisma.userCalendarSetting.create({
      data: {
        userId: users[0].id,
        calendarId: calendars[1].id, // John's work calendar
        syncEnabled: true,
        conflictResolution: 'auto_decline',
        notificationsEnabled: true,
        defaultEventDuration: 30, // 30 minutes
      },
    }),
    prisma.userCalendarSetting.create({
      data: {
        userId: users[1].id,
        calendarId: calendars[2].id, // Jane's main calendar
        syncEnabled: true,
        conflictResolution: 'manual',
        notificationsEnabled: true,
        defaultEventDuration: 60, // 1 hour
      },
    }),
    prisma.userCalendarSetting.create({
      data: {
        userId: users[1].id,
        calendarId: calendars[3].id, // Jane's family calendar
        syncEnabled: true,
        conflictResolution: 'auto_accept',
        notificationsEnabled: false,
        defaultEventDuration: 120, // 2 hours
      },
    }),
    prisma.userCalendarSetting.create({
      data: {
        userId: users[2].id,
        calendarId: calendars[4].id, // Demo calendar
        syncEnabled: true,
        conflictResolution: 'manual',
        notificationsEnabled: true,
        defaultEventDuration: 60, // 1 hour
      },
    }),
  ]);

  console.log(`✅ Created ${settings.length} user calendar settings`);

  // Detailed Summary
  console.log('\n🎉 Database seeding completed successfully!');
  console.log('='.repeat(80));
  console.log(`
📊 SEEDING SUMMARY
${'='.repeat(80)}

👤 USERS (${users.length} created):
${users
  .map(
    (user, i) =>
      `   ${i + 1}. ${user.displayName} (${user.email}) - ${user.timeZone}`,
  )
  .join('\n')}

🔗 CONNECTED ACCOUNTS (${connectedAccounts.length} created):
${connectedAccounts
  .map((acc, i) => `   ${i + 1}. ${acc.provider} - ${acc.providerAccountId}`)
  .join('\n')}

📅 CALENDARS (${calendars.length} created):
${calendars
  .map(
    (cal, i) =>
      `   ${i + 1}. "${cal.name}" ${cal.isDefault ? '(Default)' : ''} - ${cal.color}`,
  )
  .join('\n')}

📝 EVENTS (${events.length} created):
${events
  .map((event, i) => {
    const date = event.startTime.toLocaleDateString();
    const time = event.isAllDay
      ? 'All Day'
      : event.startTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
    return `   ${i + 1}. "${event.title}" - ${date} ${time}`;
  })
  .join('\n')}

⚙️  CALENDAR SETTINGS (${settings.length} created):
${settings
  .map(
    (setting, i) =>
      `   ${i + 1}. Sync: ${setting.syncEnabled ? '✓' : '✗'}, Notifications: ${setting.notificationsEnabled ? '✓' : '✗'}, Default Duration: ${setting.defaultEventDuration}min`,
  )
  .join('\n')}

🔍 TEST ACCOUNTS:
• john.doe@example.com
  - Google Calendar integration
  - 2 calendars: Personal, Work
  - Timezone: America/New_York

• jane.smith@example.com
  - Outlook Calendar integration  
  - 2 calendars: Main Calendar, Family
  - Timezone: America/Los_Angeles

• demo@unical.app
  - Google Calendar integration
  - 1 calendar: Demo Calendar
  - Timezone: UTC

💡 NEXT STEPS:
1. Start the backend: yarn workspace @unical/backend dev
2. Start the frontend: yarn workspace @unical/frontend dev
3. Test with any of the sample accounts above
4. Check the calendar views for seeded events

${'='.repeat(80)}
  `);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
