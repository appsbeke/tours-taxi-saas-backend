import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  findAll() {
    return this.userRepo.find({ relations: ['roles', 'customerProfile', 'driverProfile', 'guideProfile'] });
  }

  findOne(id: string) {
    return this.userRepo.findOne({ 
      where: { id },
      relations: ['roles', 'customerProfile', 'driverProfile', 'guideProfile'] 
    });
  }

  async update(id: string, data: Partial<User>) {
    await this.userRepo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    return this.userRepo.softDelete(id);
  }
}
