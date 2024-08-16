import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the user.',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'foobar123',
    description: 'A password for the user.',
  })
  @IsNotEmpty()
  @IsString()
  hash: string;

  @ApiProperty({
    example: 'foo@bar.com',
    description: 'The email of the user.',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
