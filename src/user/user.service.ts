import { ForbiddenException, Injectable } from '@nestjs/common';
import * as argon from 'argon2';

import { CreateUserDto, EditUserDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(
    dto: CreateUserDto,
  ): Promise<Pick<CreateUserDto, 'email' | 'name'> & { id: number }> {
    const argonHash = await argon.hash(dto.hash);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        hash: argonHash,
        name: dto.name,
      },
    });

    return { email: user.email, name: user.name, id: user.id };
  }

  async findUserById(
    userId: number,
  ): Promise<Pick<CreateUserDto, 'email' | 'name'>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    return { email: user.email, name: user.name };
  }

  async updateUserById(
    userId: number,
    paramUserId: number,
    dto: EditUserDto,
  ): Promise<Pick<CreateUserDto, 'email' | 'name'>> {
    if (userId === paramUserId) {
      const argonHash = dto.hash ? await argon.hash(dto.hash) : undefined;

      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          email: undefined || dto.email,
          name: undefined || dto.email,
          hash: undefined || argonHash,
        },
      });

      return { email: user.email, name: user.name };
    } else {
      throw new ForbiddenException('Credentials taken');
    }
  }

  async deleteUserById(userId: number): Promise<{ deletedUserWithId: number }> {
    const user = await this.prisma.user.delete({
      where: { id: userId },
    });

    return { deletedUserWithId: user.id };
  }
}
