import { IsDate, IsInt, IsNotEmpty } from 'class-validator';

export class CreateEnrollmentDto {
  @IsInt()
  @IsNotEmpty()
  studentId: number;

  @IsInt()
  @IsNotEmpty()
  courseId: number;

  @IsDate()
  @IsNotEmpty()
  enrolledAt: Date;
}
