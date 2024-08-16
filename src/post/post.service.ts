import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, RateDto, UpdatePostDto } from './dto';
import { FunPost } from './types';
import { PostRate } from '@prisma/client';
import { FunComment } from '../comment/types';
import { AwsService } from '../aws/aws.service';

@Injectable()
export class PostService {
  constructor(
    private prisma: PrismaService,
    private aws: AwsService,
  ) {}

  // TODO: move to util
  getRating(rates: PostRate[]): { likes: number; dislikes: number } {
    return rates.reduce(
      (acc, cur): { likes: number; dislikes: number } => {
        return cur.rating === 'like'
          ? { likes: acc.likes + 1, dislikes: acc.dislikes }
          : { likes: acc.likes, dislikes: acc.dislikes + 1 };
      },
      { likes: 0, dislikes: 0 },
    );
  }

  async create(
    userId: number,
    dto: CreatePostDto,
    file?: Express.Multer.File,
  ): Promise<FunPost> {
    let imgUrl;

    if (file) {
      imgUrl = await this.aws.uploadFile(file.originalname, file);
    }

    const createdPost = await this.prisma.post.create({
      data: {
        title: dto.title,
        description: dto.description,
        userId,
        imageUrl: imgUrl,
        PostView: { create: { userId } },
      },
    });

    return { ...createdPost, likes: 0, dislikes: 0 };
  }

  async update(
    postId: number,
    userId: number,
    dto: UpdatePostDto,
    file?: Express.Multer.File,
  ): Promise<FunPost> {
    let imgUrl;

    const currentPost = await this.prisma.post.findUniqueOrThrow({
      where: { id: postId },
    });

    if (currentPost.userId !== userId) {
      throw new ForbiddenException('Access Denined.');
    }

    if (file) {
      // TODO: should delete the old image.
      imgUrl = await this.aws.uploadFile(file.originalname, file);
    }

    await this.prisma.postHistory.create({
      data: {
        title: currentPost.title,
        description: currentPost.description,
        postId: currentPost.id,
      },
    });

    const updatedPost = await this.prisma.post.update({
      where: { id: postId },
      data: {
        title: dto.title || undefined,
        description: dto.description || undefined,
        imageUrl: imgUrl,
        userId,
      },
      include: { PostRate: true },
    });

    return {
      id: updatedPost.id,
      createdAt: updatedPost.createdAt,
      updatedAt: updatedPost.updatedAt,
      userId: updatedPost.userId,
      title: updatedPost.title,
      description: updatedPost.description,
      imageUrl: updatedPost.imageUrl,
      ...this.getRating(updatedPost.PostRate),
    };
  }

  async getById(
    postId: number,
    userId: number,
  ): Promise<
    FunPost & {
      comments: FunComment[];
      views: number;
    }
  > {
    const currentPost = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        PostView: true,
        Comment: { where: { wasDeletedByUserWithId: null } }, //
        PostRate: true,
      },
    });

    const hasView = !!currentPost.PostView.find(
      (view) => view.userId === userId,
    );

    if (!hasView) {
      await this.prisma.postView.create({ data: { postId, userId } });
    }

    return {
      id: currentPost.id,
      createdAt: currentPost.createdAt,
      updatedAt: currentPost.updatedAt,
      userId: currentPost.userId,
      title: currentPost.title,
      description: currentPost.description,
      imageUrl: currentPost.imageUrl,
      comments: currentPost.Comment,
      views: currentPost.PostView.length,
      ...this.getRating(currentPost.PostRate),
    };
  }

  async ratePost(
    postId: number,
    userId: number,
    dto: RateDto,
  ): Promise<boolean> {
    await this.prisma.postRate.upsert({
      where: { id: postId },
      create: {
        userId: userId,
        postId: postId,
        rating: dto.rate,
      },
      update: {
        rating: dto.rate,
      },
    });

    return true;
  }

  async deleteById(postId: number, userId: number): Promise<boolean> {
    const currentPost = await this.prisma.post.findUniqueOrThrow({
      where: { id: postId },
      select: { userId: true },
    });

    if (currentPost.userId === userId) {
      await this.prisma.post.delete({
        where: { id: postId },
      });
    }

    return true;
  }
}
