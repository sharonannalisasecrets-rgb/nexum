import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import type { ApiResponseEnvelope } from '../../shared/api-response-envelope';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  meta(requestId: string): ApiResponseEnvelope<unknown>['meta'] {
    return { timestamp: new Date().toISOString(), requestId };
  }

  async register(body: any) {
    const email = String(body?.email ?? '').toLowerCase();
    const password = String(body?.password ?? '');
    const fullName = String(body?.fullName ?? body?.name ?? '');
    const role = body?.role;

    if (!email || !password || !fullName) {
      throw new UnauthorizedException('Missing registration fields');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Default role to worshipper if not provided.
    const userRole = role ?? 'worshipper';

    const user = await this.prisma.user.create({
      data: {
        email,
        fullName,
        passwordHash,
        role: userRole,
      },
      select: { id: true, fullName: true, email: true, role: true },
    });

    return { user };
  }

  async login(body: any) {
    const email = String(body?.email ?? '').toLowerCase();
    const password = String(body?.password ?? '');
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const accessToken = this.jwt.sign({
      userId: user.id,
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });

    // Refresh token (hash stored). For now we return a plain refresh token.
    // Production should store refresh token hash and rotate.
    const refreshToken = `rt_${user.id}_${Date.now()}_${Math.random().toString(16).slice(2)}`;

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshToken,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      },
    });

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
      expiresIn: 60 * 15,
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) throw new UnauthorizedException('Missing refreshToken');

    const tokenRow = await this.prisma.refreshToken.findUnique({ where: { tokenHash: refreshToken } });
    if (!tokenRow) throw new UnauthorizedException('Invalid refreshToken');
    if (tokenRow.expiresAt.getTime() < Date.now()) throw new UnauthorizedException('Refresh token expired');

    const user = await this.prisma.user.findUnique({ where: { id: tokenRow.userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const accessToken = this.jwt.sign({
      userId: user.id,
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });

    return {
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
      accessToken,
      refreshToken,
      expiresIn: 60 * 15,
    };
  }

  async updateProfile(userId: string, body: any) {
    if (!userId) throw new UnauthorizedException('Missing userId');

    const fullName = body?.fullName ?? body?.name;
    const phoneNumber = body?.phoneNumber;
    const emergencyContactName = body?.emergencyContactName;
    const emergencyContactPhone = body?.emergencyContactPhone;
    const estateOrZone = body?.estateOrZone;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName ? { fullName: String(fullName) } : {}),
        ...(phoneNumber !== undefined ? { phoneNumber: String(phoneNumber) } : {}),
        ...(emergencyContactName !== undefined ? { emergencyContactName: String(emergencyContactName) } : {}),
        ...(emergencyContactPhone !== undefined ? { emergencyContactPhone: String(emergencyContactPhone) } : {}),
        ...(estateOrZone !== undefined ? { estateOrZone: String(estateOrZone) } : {}),
      },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, email: true, role: true },
    });

    return user;
  }
}

