import { IsDate, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsDate()
  @IsNotEmpty()
  enrolledAt: Date;
}
