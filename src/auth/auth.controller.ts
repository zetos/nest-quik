import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto';
import { JwtPayloadWithRt, Tokens } from './types';
import { GetUser, Public } from '../common/decorators';
import { RTokenGuard } from '../common/guards';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @ApiOperation({
    summary: 'Sign up a new user',
    description:
      'Registers a new user with the provided credentials. The user receives authentication tokens upon successful registration.',
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered.',
    example: {
      access_token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsImVtYWlsIjoiZ3Jhbm55QGRpc2MuY29tIiwiaWF0IjoxNzIzNzUyOTgwLCJleHAiOjE3MjM3NTM4ODB9.UoE34Eh8nLiTstmfocfKNpV6MyGJ5Z4KysAZHf1_XvA',
      refresh_token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsImVtYWlsIjoiZ3Jhbm55QGRpc2MuY29tIiwiaWF0IjoxNzIzNzUyOTgwLCJleHAiOjE3MjQyNzEzODB9.9A2AwxtMPxl8SBK-vdQSK9AKv68JfUbLrIdniRTKU2o',
    },
  })
  @Post('signup')
  signupLocal(@Body() dto: SignUpDto): Promise<Tokens> {
    return this.authService.signupLocal(dto);
  }

  @Public()
  @ApiOperation({
    summary: 'Sign in an existing user',
    description:
      'Authenticates a user with the provided credentials. Returns authentication tokens upon successful login.',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully signed in.',
    example: {
      access_token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsImVtYWlsIjoiZ3Jhbm55QGRpc2MuY29tIiwiaWF0IjoxNzIzNzUyOTgwLCJleHAiOjE3MjM3NTM4ODB9.UoE34Eh8nLiTstmfocfKNpV6MyGJ5Z4KysAZHf1_XvA',
      refresh_token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsImVtYWlsIjoiZ3Jhbm55QGRpc2MuY29tIiwiaWF0IjoxNzIzNzUyOTgwLCJleHAiOjE3MjQyNzEzODB9.9A2AwxtMPxl8SBK-vdQSK9AKv68JfUbLrIdniRTKU2o',
    },
  })
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  signinLocal(@Body() dto: SignInDto): Promise<Tokens> {
    return this.authService.signinLocal(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Log out a user',
    description:
      'Logs out the currently authenticated user. The user’s refresh_token is invalidated.',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged out.',
  })
  @ApiResponse({
    status: 401,
    description:
      'Unauthorized. User is not logged in or the session is invalid.',
  })
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetUser('sub') userId: number): Promise<boolean> {
    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(RTokenGuard)
  @ApiOperation({
    summary: 'Refresh authentication tokens',
    description:
      'Refreshes the authentication tokens for the currently authenticated user using a valid refresh token. Use the refresh_token here.',
  })
  @ApiResponse({
    status: 200,
    description: 'Tokens successfully refreshed.',
    example: {
      access_token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsImVtYWlsIjoiZ3Jhbm55QGRpc2MuY29tIiwiaWF0IjoxNzIzNzUyOTgwLCJleHAiOjE3MjM3NTM4ODB9.UoE34Eh8nLiTstmfocfKNpV6MyGJ5Z4KysAZHf1_XvA',
      refresh_token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsImVtYWlsIjoiZ3Jhbm55QGRpc2MuY29tIiwiaWF0IjoxNzIzNzUyOTgwLCJleHAiOjE3MjQyNzEzODB9.9A2AwxtMPxl8SBK-vdQSK9AKv68JfUbLrIdniRTKU2o',
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. The refresh token is invalid or expired.',
  })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(@GetUser() user: JwtPayloadWithRt): Promise<Tokens> {
    return this.authService.refreshTokens(user.sub, user.refreshToken);
  }
}
