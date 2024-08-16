import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    example: 8,
    description: 'The id of a post.',
  })
  @IsInt()
  postId: number;

  @ApiProperty({
    example: 'Things that try to look like things.',
    description: 'The description of the comment',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
