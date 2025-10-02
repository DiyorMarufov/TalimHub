import { Controller, Post, Body, Get } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Enrollments')
@Controller()
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post('enroll')
  @ApiOperation({ summary: 'Enroll a student into a course' })
  @ApiResponse({ status: 201, description: 'Enrollment created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  enroll(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.enrollmentService.enroll(createEnrollmentDto);
  }

  @Post('complete')
  @ApiOperation({ summary: 'Complete an enrollment' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { enrollmentId: { type: 'number', example: 5 } },
    },
  })
  @ApiResponse({ status: 200, description: 'Enrollment marked as completed' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  complete(@Body() body: { enrollmentId: number }) {
    return this.enrollmentService.complete(body.enrollmentId);
  }

  @Post('unenroll')
  @ApiOperation({ summary: 'Unenroll a student from a course' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { enrollmentId: { type: 'number', example: 5 } },
    },
  })
  @ApiResponse({ status: 200, description: 'Successfully unenrolled' })
  @ApiResponse({ status: 404, description: 'Enrollment not found' })
  unenroll(@Body() body: { enrollmentId: number }) {
    return this.enrollmentService.unenroll(body.enrollmentId);
  }

  @Get('enrollments/active')
  @ApiOperation({ summary: 'Get all active enrollments' })
  @ApiResponse({
    status: 200,
    description: 'List of active enrollments',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          studentId: { type: 'number', example: 10 },
          courseId: { type: 'number', example: 3 },
          isCompleted: { type: 'boolean', example: false },
        },
      },
    },
  })
  activeEnrollments() {
    return this.enrollmentService.activeEnrollments();
  }
}
