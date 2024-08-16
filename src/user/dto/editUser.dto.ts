import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EditUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the user.',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'foobar123',
    description: 'A password for the user.',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  hash?: string;

  @ApiProperty({
    example: 'foo@bar.com',
    description: 'The email of the user.',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;
}
