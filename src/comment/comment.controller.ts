import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { GetUser } from '../common/decorators';
import { CreateCommentDto, UpdateCommentDto } from './dto';
import { FunComment } from './types';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Comment')
@Controller('comment')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @ApiOperation({
    summary: 'Create a new comment on a post',
    description:
      'Allows a user to create a new comment on a specific post. The user must be authenticated.',
  })
  @ApiResponse({
    status: 201,
    description: 'The comment was successfully created.',
    example: {
      id: 1,
      createdAt: '2024-08-15T23:23:28.164Z',
      updatedAt: '2024-08-15T23:23:28.183Z',
      userId: 1,
      postId: 1,
      description: 'This is a sample comment.',
    },
  })
  @Post()
  createComment(
    @Body() dto: CreateCommentDto,
    @GetUser('sub') userId: number,
  ): Promise<FunComment> {
    return this.commentService.create(userId, dto);
  }

  @ApiOperation({
    summary: 'Edit a comment on a post',
    description:
      'Allows the creator of a comment to update its content. Only the original author of the comment can perform this action.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated the comment.',
    example: {
      id: 1,
      createdAt: '2024-08-15T23:23:28.164Z',
      updatedAt: '2024-08-15T23:23:28.183Z',
      userId: 1,
      postId: 1,
      description: 'This is the updated comment text.',
    },
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the comment to be updated',
    example: 1,
  })
  @Patch(':id')
  updatePost(
    @Param('id', ParseIntPipe) commentId: number,
    @Body() dto: UpdateCommentDto,
    @GetUser('sub') userId: number,
  ): Promise<FunComment> {
    return this.commentService.update(userId, commentId, dto);
  }

  @ApiOperation({
    summary: 'Delete a comment on a post',
    description:
      'Allows the creator of a comment to delete it. Only the original author of the comment can perform this action.',
  })
  @ApiResponse({
    status: 200,
    description: 'The comment was successfully deleted.',
    example: true,
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found. The comment does not exist.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the comment to be deleted',
    example: 1,
  })
  @Delete(':id')
  deletePost(
    @Param('id', ParseIntPipe) commentId: number,
    @GetUser('sub') userId: number,
  ): Promise<boolean> {
    return this.commentService.deleteById(commentId, userId);
  }
}
