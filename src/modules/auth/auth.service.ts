import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(phone: string, password: string, email?: string) {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({
      phone,
      email,
      passwordHash,
      status: 'active',
    });
    await this.userRepo.save(user);
    return this.generateToken(user);
  }

  async login(phone: string, password: string) {
    const user = await this.userRepo.findOne({ where: { phone } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    user.lastLoginAt = new Date();
    await this.userRepo.save(user);
    return this.generateToken(user);
  }

  async validateUser(userId: string): Promise<User> {
    return this.userRepo.findOne({ where: { id: userId }, relations: ['roles'] });
  }

  private generateToken(user: User) {
    const payload = { sub: user.id, phone: user.phone };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
      },
    };
  }
}
