import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  async findAll() {
    return 'This action returns all users';
  }
}
