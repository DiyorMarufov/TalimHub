import { IsDate, IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '2025-01-01T00:00:00.000Z',
    description: 'Enrollment date (ISO string)',
  })
  @IsDate()
  @IsNotEmpty()
  enrolledAt: Date;
}
