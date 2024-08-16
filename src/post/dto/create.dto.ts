import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({
    example: 'Thing',
    description: 'The title of the post',
  })
  @IsString()
  @Length(1, 100)
  title: string;

  @ApiProperty({
    example: 'Things that try to look.',
    description: 'The description of the post',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
