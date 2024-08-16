import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum PostRating {
  LIKE = 'like',
  DISLIKE = 'dislike',
}

export class RateDto {
  @ApiProperty({
    example: 'like',
    description: 'The user rating of a post, can be "like" or a "dislike"',
    enum: PostRating,
  })
  @IsEnum(PostRating)
  rate: PostRating;
}
