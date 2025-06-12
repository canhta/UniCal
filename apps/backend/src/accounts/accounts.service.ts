import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/encryption/encryption.service';
import {
  ConnectedAccountResponseDto,
  InternalCreateConnectedAccountDto,
  InternalUpdateConnectedAccountDto,
} from './dto/accounts.dto';
import { ConnectedAccount } from '@prisma/client';

@Injectable()
export class AccountsService {
  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
    private configService: ConfigService,
  ) {}

  async createConnectedAccount(
    data: InternalCreateConnectedAccountDto,
  ): Promise<ConnectedAccount> {
    // Check if account already exists for this user and provider
    const existingAccount = await this.prisma.connectedAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: data.provider,
          providerAccountId: data.providerAccountId,
        },
      },
    });

    if (existingAccount) {
      throw new ConflictException(
        'Account already connected for this provider',
      );
    }

    // Encrypt tokens before storing
    const encryptedAccessToken = this.encryptionService.encrypt(
      data.accessToken,
    );
    const encryptedRefreshToken = data.refreshToken
      ? this.encryptionService.encrypt(data.refreshToken)
      : null;

    return this.prisma.connectedAccount.create({
      data: {
        userId: data.userId,
        provider: data.provider,
        providerAccountId: data.providerAccountId,
        encryptedAccessToken,
        encryptedRefreshToken,
        tokenExpiresAt: data.expiresAt,
        scope: data.scopes?.join(' '),
      },
    });
  }

  async getConnectedAccountsForUser(
    userId: string,
  ): Promise<ConnectedAccountResponseDto[]> {
    const accounts = await this.prisma.connectedAccount.findMany({
      where: { userId },
    });

    return accounts.map((account) => this.toResponseDto(account));
  }

  async getConnectedAccountById(
    userId: string,
    accountId: string,
  ): Promise<ConnectedAccountResponseDto> {
    const account = await this.prisma.connectedAccount.findFirst({
      where: {
        id: accountId,
        userId,
      },
    });

    if (!account) {
      throw new NotFoundException('Connected account not found');
    }

    return this.toResponseDto(account);
  }

  async updateConnectedAccountTokens(
    accountId: string,
    data: InternalUpdateConnectedAccountDto,
  ): Promise<ConnectedAccount> {
    const encryptedAccessToken = this.encryptionService.encrypt(
      data.accessToken,
    );
    const encryptedRefreshToken = data.refreshToken
      ? this.encryptionService.encrypt(data.refreshToken)
      : undefined;

    return this.prisma.connectedAccount.update({
      where: { id: accountId },
      data: {
        encryptedAccessToken,
        encryptedRefreshToken,
        tokenExpiresAt: data.expiresAt,
        updatedAt: new Date(),
      },
    });
  }

  async deleteConnectedAccount(
    userId: string,
    accountId: string,
  ): Promise<void> {
    const account = await this.prisma.connectedAccount.findFirst({
      where: {
        id: accountId,
        userId,
      },
    });

    if (!account) {
      throw new NotFoundException('Connected account not found');
    }

    await this.prisma.connectedAccount.delete({
      where: { id: accountId },
    });
  }

  async getDecryptedAccessToken(accountId: string): Promise<string> {
    const account = await this.prisma.connectedAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException('Connected account not found');
    }

    return this.encryptionService.decrypt(account.encryptedAccessToken);
  }

  async getDecryptedRefreshToken(accountId: string): Promise<string | null> {
    const account = await this.prisma.connectedAccount.findUnique({
      where: { id: accountId },
    });

    if (!account || !account.encryptedRefreshToken) {
      return null;
    }

    return this.encryptionService.decrypt(account.encryptedRefreshToken);
  }

  private toResponseDto(
    account: ConnectedAccount,
  ): ConnectedAccountResponseDto {
    return {
      id: account.id,
      userId: account.userId,
      provider: account.provider,
      providerAccountId: account.providerAccountId,
      accountEmail: undefined, // Would need to be stored separately
      scopes: account.scope ? account.scope.split(' ') : undefined,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }
}
