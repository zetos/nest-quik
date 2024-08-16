import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AwsService } from '../aws/aws.service';
import { CreateCommentDto, UpdateCommentDto } from './dto';
import { FunComment } from './types';

@Injectable()
export class CommentService {
  constructor(
    private prisma: PrismaService,
    private aws: AwsService,
  ) {}

  async create(userId: number, dto: CreateCommentDto): Promise<FunComment> {
    const createdComment = await this.prisma.comment.create({
      data: {
        description: dto.description,
        userId,
        postId: dto.postId,
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        postId: true,
        description: true,
        post: { select: { user: { select: { email: true, id: true } } } },
      },
    });

    // TODO: send email
    if (userId !== createdComment.post.user.id) {
      await this.aws.sendEmail(createdComment.post.user.email);
    }

    return {
      id: createdComment.id,
      createdAt: createdComment.createdAt,
      updatedAt: createdComment.updatedAt,
      userId: createdComment.userId,
      postId: createdComment.postId,
      description: createdComment.description,
    };
  }

  async update(
    userId: number,
    commentId: number,
    dto: UpdateCommentDto,
  ): Promise<FunComment> {
    const updatedComment = await this.prisma.comment.update({
      where: {
        id: commentId,
        userId,
      },
      data: {
        description: dto.description,
      },
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        postId: true,
        description: true,
      },
    });

    return updatedComment;
  }

  async deleteById(commentId: number, userId: number): Promise<boolean> {
    const currentComment = await this.prisma.comment.findUniqueOrThrow({
      where: { id: commentId },
      select: { userId: true, post: { select: { userId: true } } },
    });

    if (
      currentComment.userId === userId ||
      currentComment.post.userId === userId
    ) {
      await this.prisma.comment.update({
        where: { id: commentId },
        data: { wasDeletedByUserWithId: userId },
      });
    }

    return true;
  }
}
