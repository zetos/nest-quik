import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({
    example: 'foobar123',
    description: 'A password for the user.',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    example: 'foo@bar.com',
    description: 'The email of the user.',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
