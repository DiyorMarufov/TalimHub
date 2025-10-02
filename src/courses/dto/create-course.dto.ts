import { IsDate, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ example: 'NestJS Bootcamp' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'A complete NestJS backend development course' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: '2025-01-01T00:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @IsDate()
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({
    example: '2025-03-01T00:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @IsDate()
  @IsNotEmpty()
  endDate: Date;

  @ApiProperty({ example: 30 })
  @IsInt()
  @IsNotEmpty()
  capacity: number;
}
