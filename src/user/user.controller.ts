import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { UserService } from './user.service';
import { CreateUserDto, EditUserDto } from './dto';
import { GetUser } from '../auth/decorator';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Create a user' })
  @ApiResponse({
    status: 201,
    description: 'Create a user',
    type: CreateUserDto, // TODO: check this
  })
  @Post()
  create(
    @Body() dto: CreateUserDto,
  ): Promise<Pick<CreateUserDto, 'email' | 'name'>> {
    return this.userService.create(dto);
  }

  @ApiOperation({ summary: 'Get user information.' })
  @ApiResponse({
    status: 200,
    description: 'Get user information.',
  })
  @Patch(':id')
  updateUser(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) paramUserId: number,
    @Body() dto: EditUserDto,
  ): Promise<Pick<EditUserDto, 'email' | 'name'>> {
    return this.userService.updateUserById(userId, paramUserId, dto);
  }

  @ApiOperation({ summary: 'Get user information.' })
  @ApiResponse({
    status: 200,
    description: 'Get user information.',
  })
  @Get('me')
  getMe(
    @GetUser('id') userId: number,
  ): Promise<Pick<CreateUserDto, 'email' | 'name'>> {
    return this.userService.findUserById(userId);
  }
}
