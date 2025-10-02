import { IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEnrollmentDto {
  @ApiProperty({ example: 1, description: 'ID of the student' })
  @IsInt()
  @IsNotEmpty()
  studentId: number;

  @ApiProperty({ example: 10, description: 'ID of the course' })
  @IsInt()
  @IsNotEmpty()
  courseId: number;
}
