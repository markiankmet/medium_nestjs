import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';

import { UserService } from './user.service';
import { UserEntity } from './user.entity';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
import { UserResponseInterface } from './types/userResponse.interface';
import { User } from './decorators/user.decorator';
import { AuthGuard } from './guards/auth.guard';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('users')
  @UsePipes(new ValidationPipe())
  async create(
    @Body('user') createUserDto: CreateUserDto,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.create(createUserDto);
    return this.userService.buildUserResponse(user);
  }

  @Post('users/login')
  @UsePipes(new ValidationPipe())
  async login(
    @Body('user') loginUserDto: LoginUserDto,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.login(loginUserDto);
    return this.userService.buildUserResponse(user);
  }

  @Get('user')
  @UseGuards(AuthGuard)
  async currentUser(@User() user: UserEntity): Promise<UserResponseInterface> {
    return this.userService.buildUserResponse(user);
  }

  @Put('user')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async updateUser(
    @Body('user') updateUserDto: UpdateUserDto,
    @User('id') currentUserId: number,
  ): Promise<UserResponseInterface> {
    const user = await this.userService.updateUser(
      updateUserDto,
      currentUserId,
    );
    return this.userService.buildUserResponse(user);
  }
}
