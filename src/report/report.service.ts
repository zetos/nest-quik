import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FunReport } from './types';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  async generateReport(): Promise<FunReport> {
    const posts = await this.prisma.post.findMany({
      orderBy: { createdAt: 'asc' },
      take: 100,
      select: {
        title: true,
        PostRate: true,
        _count: {
          select: {
            PostView: true,
            Comment: true,
            PostRate: {
              where: {
                rating: 'like',
              },
            },
          },
        },
      },
    });

    return posts.map((post) => ({
      title: post.title,
      numberOfComments: post._count?.Comment || 0,
      views: post._count?.PostView || 0,
      likes: post._count?.PostRate || 0,
      dislikes: post.PostRate.length - post._count?.PostRate || 0,
    }));
  }
}
