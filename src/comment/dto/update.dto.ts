import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiProperty({
    example: 'Things that try to look like things.',
    description: 'The description of the comment',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
