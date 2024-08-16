import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { AwsService } from '../aws/aws.service';

@Module({
  controllers: [PostController],
  providers: [PostService, AwsService],
})
export class PostModule {}
