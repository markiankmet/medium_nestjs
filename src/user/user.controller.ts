import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { UserService } from './user.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { UserResponseInterface } from './types/userResponse.interface';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('')
  @UsePipes(new ValidationPipe())
  async create(
    @Body('user') createUserDto: CreateUserDto,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.create(createUserDto);
    return this.userService.buildUserResponse(user);
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(
    @Body('user') loginUserDto: LoginUserDto,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.login(loginUserDto);
    return this.userService.buildUserResponse(user);
  }
}
