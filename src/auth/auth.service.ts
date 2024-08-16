import * as argon from 'argon2';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignInDto, SignUpDto } from './dto';
import { Tokens } from './types';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async getTokens(userId: number, email: string): Promise<Tokens> {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.config.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.config.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
          expiresIn: '6d',
        },
      ),
    ]);

    return { access_token, refresh_token };
  }

  async updateRefreshTokenHash(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    const argonHash = await argon.hash(refreshToken);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        hashedRt: argonHash,
      },
    });
  }

  async signupLocal(dto: SignUpDto): Promise<Tokens> {
    const argonHash = await argon.hash(dto.password);

    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email,
        hash: argonHash,
        name: dto.name,
      },
    });

    const tokens = await this.getTokens(newUser.id, newUser.email);
    await this.updateRefreshTokenHash(newUser.id, tokens.refresh_token);

    return tokens;
  }

  async signinLocal(dto: SignInDto): Promise<Tokens> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { email: dto.email },
    });

    if (!user) throw new ForbiddenException('Access Denined.');

    const hashMatches = await argon.verify(user.hash, dto.password);
    if (!hashMatches) throw new ForbiddenException('Access Denined.');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async logout(userId: number): Promise<boolean> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        hashedRt: null,
      },
    });

    return true;
  }

  async refreshTokens(userId: number, refreshToken: string): Promise<Tokens> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.hashedRt)
      throw new ForbiddenException('Access Denined.');

    const refreshHashMatches = await argon.verify(user.hashedRt, refreshToken);
    if (!refreshHashMatches) throw new ForbiddenException('Access Denined.');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

    return tokens;
  }
}
