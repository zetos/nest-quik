import { Injectable } from '@nestjs/common';
import * as argon from 'argon2';

import { EditUserDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findUserById(
    userId: number,
  ): Promise<Pick<EditUserDto, 'email' | 'name'>> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    return { email: user.email, name: user.name };
  }

  async updateUserById(
    userId: number,
    dto: EditUserDto,
  ): Promise<Pick<EditUserDto, 'email' | 'name'>> {
    const argonHash = dto.hash ? await argon.hash(dto.hash) : undefined;

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: undefined || dto.email,
        name: undefined || dto.name,
        hash: undefined || argonHash,
      },
    });

    return { email: user.email, name: user.name };
  }

  async deleteUserById(userId: number): Promise<{ deletedUserWithId: number }> {
    const user = await this.prisma.user.delete({
      where: { id: userId },
    });

    return { deletedUserWithId: user.id };
  }
}
