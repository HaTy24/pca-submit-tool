import { Controller, Get } from '@nestjs/common';
import { AuthService } from './submit.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('login')
  login() {
    return this.authService.login();
  }
}
