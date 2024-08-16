import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { AwsService } from '../aws/aws.service';

@Module({
  providers: [CommentService, AwsService],
  controllers: [CommentController],
})
export class CommentModule {}
