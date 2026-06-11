import { Body, Controller, Get, Put, Post, Req, UseGuards } from '@nestjs/common';
import type { ApiResponseEnvelope } from '../../shared/api-response-envelope';
import { AuthService } from './auth.service';
import type { Request } from 'express';
import { JwtAccessGuard } from './jwt-access.guard';


@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  async register(@Body() body: any): Promise<ApiResponseEnvelope<any>> {
    const data = await this.auth.register(body);
    return {
      success: true,
      data,
      meta: this.auth.meta('auth.register'),
    };
  }

  @Post('login')
  async login(@Body() body: any): Promise<ApiResponseEnvelope<any>> {
    const data = await this.auth.login(body);
    return {
      success: true,
      data,
      meta: this.auth.meta('auth.login'),
    };
  }

  @Post('refresh')
  async refresh(@Body() body: any): Promise<ApiResponseEnvelope<any>> {
    const data = await this.auth.refresh(body.refreshToken);
    return {
      success: true,
      data,
      meta: this.auth.meta('auth.refresh'),
    };
  }

  @UseGuards(JwtAccessGuard)
  @Get('me')
  async me(@Req() req: Request): Promise<ApiResponseEnvelope<any>> {
    const user = (req as any).user;
    return {
      success: true,
      data: user,
      meta: this.auth.meta('auth.me'),
    };
  }

  @UseGuards(JwtAccessGuard)
  @Put('me/profile')
  async updateProfile(@Req() req: Request, @Body() body: any): Promise<ApiResponseEnvelope<any>> {
    const userId = (req as any).user?.id;
    const data = await this.auth.updateProfile(userId, body);
    return {
      success: true,
      data,
      meta: this.auth.meta('auth.updateProfile'),
    };
  }

  // OTP/password-reset flow (stubbed for now)
  @Post('forgot-password')
  async forgotPassword(@Body() body: any): Promise<ApiResponseEnvelope<any>> {
    // Frontend expects success true/false. We'll implement later.
    return {
      success: true,
      data: { sent: true },
      meta: this.auth.meta('auth.forgotPassword'),
    };
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: any): Promise<ApiResponseEnvelope<any>> {
    return {
      success: true,
      data: { verified: true },
      meta: this.auth.meta('auth.verifyOtp'),
    };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: any): Promise<ApiResponseEnvelope<any>> {
    return {
      success: true,
      data: { reset: true },
      meta: this.auth.meta('auth.resetPassword'),
    };
  }
}

