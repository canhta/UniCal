import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { EncryptionService } from './common/encryption/encryption.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AccountsModule } from './accounts/accounts.module';
import { EventsModule } from './events/events.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    AccountsModule,
    EventsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [EncryptionService],
})
export class AppModule {}
