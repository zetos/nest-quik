import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
} from '@nestjs/common';
import { Express } from 'express';
import { PostService } from './post.service';
import { CreatePostDto, RateDto, UpdatePostDto } from './dto';
import { GetUser } from '../common/decorators';
import { FunPost } from './types';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Post')
@Controller('post')
export class PostController {
  constructor(private postService: PostService) {}

  @ApiOperation({
    summary: 'Create a new post',
    description: 'Allows a logged-in user to create a new post.',
  })
  @ApiResponse({
    status: 201,
    description: 'The post was successfully created.',
    example: {
      id: 1,
      createdAt: '2024-08-15T23:23:28.164Z',
      updatedAt: '2024-08-15T23:23:28.183Z',
      likes: 0,
      dislikes: 0,
      userId: 1,
      title: 'First Post !!',
      description: 'bad description..',
      imageUrl: null,
    },
  })
  @Post()
  createPost(
    @Body() dto: CreatePostDto,
    @GetUser('sub') userId: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000 }),
          new FileTypeValidator({ fileType: /image\/(jpeg|png|gif)/ }),
        ],
        fileIsRequired: false,
      }),
    )
    _file?: Express.Multer.File,
  ): Promise<FunPost> {
    //file.buffer.toString()
    return this.postService.create(userId, dto);
  }

  @ApiOperation({
    summary: 'Update an existing post',
    description: 'Allows the creator of a post to update its content.',
  })
  @ApiResponse({
    status: 200,
    description: 'The post was successfully updated.',
    example: {
      id: 1,
      createdAt: '2024-08-15T23:23:28.164Z',
      updatedAt: '2024-08-15T23:23:28.183Z',
      likes: 0,
      dislikes: 0,
      userId: 1,
      title: 'First Post !!',
      description: 'good description.',
      imageUrl: null,
    },
  })
  @Patch(':id')
  updatePost(
    @Param('id', ParseIntPipe) postId: number,
    @Body() dto: UpdatePostDto,
    @GetUser('sub') userId: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000 }),
          new FileTypeValidator({ fileType: /image\/(jpeg|png|gif)/ }),
        ],
        fileIsRequired: false,
      }),
    )
    _file?: Express.Multer.File,
  ): Promise<FunPost> {
    return this.postService.update(postId, userId, dto);
  }

  @ApiOperation({
    summary: 'Retrieve a specific post',
    description:
      'Fetches the details of a specific post by its ID. The user must be logged in to access this endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'The post details were successfully retrieved.',
    example: {
      id: 1,
      createdAt: '2024-08-15T23:23:28.164Z',
      updatedAt: '2024-08-15T23:23:28.183Z',
      likes: 0,
      dislikes: 0,
      userId: 1,
      title: 'First Post !!',
      description: 'good description.',
      imageUrl: null,
      comments: [],
      views: 1,
    },
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the post to retrieve',
    example: 1,
  })
  @Get(':id')
  getPost(
    @Param('id', ParseIntPipe) postId: number,
    @GetUser('sub') userId: number,
  ): Promise<FunPost> {
    return this.postService.getById(postId, userId);
  }

  @ApiOperation({
    summary: 'Rate a post',
    description:
      'Allows a logged-in user to like or dislike a post. The user must provide a rating value in the request body.',
  })
  @ApiResponse({
    status: 200,
    description: 'The post was successfully rated.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the post to rate',
    example: 1,
  })
  @Patch('/rate/:id')
  likePost(
    @Param('id', ParseIntPipe) postId: number,
    @Body() dto: RateDto,
    @GetUser('sub') userId: number,
  ): Promise<boolean> {
    return this.postService.ratePost(postId, userId, dto);
  }

  @ApiOperation({
    summary: 'Delete a post on a post',
    description: 'Allows the creator of a post to delete it.',
  })
  @ApiResponse({
    status: 200,
    description: 'The post was successfully deleted.',
    example: true,
  })
  @Delete(':id')
  deletePost(
    @Param('id', ParseIntPipe) postId: number,
    @GetUser('sub') userId: number,
  ): Promise<boolean> {
    return this.postService.deleteById(postId, userId);
  }
}
