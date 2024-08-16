import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePostDto {
  @ApiProperty({
    example: 'Thing',
    description: 'The title of the post',
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  title?: string;

  @ApiProperty({
    example:
      'Things that try to look like things often do look more like things than things.',
    description: 'The description of the post',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;
}
