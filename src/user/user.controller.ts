import { Body, Controller, Post } from '@nestjs/common';

import { UserService } from './user.service';
import { CreateUserDto } from './entity/dto/create-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async findAll(@Body('user') createUserDto: CreateUserDto): Promise<any> {
    console.log('createUserDto: ', createUserDto);
    return await this.userService.findAll();
  }
}
