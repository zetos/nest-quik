import { Body, Controller, Get, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UserService } from './user.service';
import { EditUserDto } from './dto';
import { GetUser } from '../common/decorators';

@ApiBearerAuth()
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get user information.' })
  @ApiResponse({
    status: 200,
    description: 'Current user information.',
    example: {
      name: 'Granny Weatherwax',
      email: 'esme_weather@discw.com',
    },
  })
  @Get('me')
  getMe(
    @GetUser('sub') userId: number,
  ): Promise<Pick<EditUserDto, 'email' | 'name'>> {
    return this.userService.findUserById(userId);
  }

  @ApiOperation({ summary: 'Updates user information.' })
  @ApiResponse({
    status: 200,
    description: 'New user information.',
    example: {
      name: 'Granny Weatherwax',
      email: 'esme_weather@discw.com',
    },
  })
  @Patch('me')
  updateUser(
    @GetUser('sub') userId: number,
    @Body() dto: EditUserDto,
  ): Promise<Pick<EditUserDto, 'email' | 'name'>> {
    return this.userService.updateUserById(userId, dto);
  }
}
