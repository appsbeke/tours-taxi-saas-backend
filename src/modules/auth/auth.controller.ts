import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { phone: string; password: string; email?: string }) {
    return this.authService.register(body.phone, body.password, body.email);
  }

  @Post('login')
  async login(@Body() body: { phone: string; password: string }) {
    return this.authService.login(body.phone, body.password);
  }
}
