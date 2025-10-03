import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiResponse({ status: 201, description: 'Course successfully created' })
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses (with optional filter)' })
  @ApiResponse({ status: 200, description: 'List of courses' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['boshlanmagan', 'davom', 'tugagan'],
    description: 'Filter by course status',
  })
  findAll(@Query('status') status?: 'boshlanmagan' | 'davom' | 'tugagan') {
    return this.coursesService.findAll(status);
  }

  @Get(':id/roster')
  @ApiOperation({ summary: 'Get all students enrolled in a course' })
  @ApiParam({ name: 'id', description: 'Course ID', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'List of enrolled students returned.',
  })
  @ApiResponse({ status: 404, description: 'Course not found.' })
  enrolledCoursesByStudents(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.enrolledCoursesByStudents(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Course found' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update course by ID' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete course by ID' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete because students are enrolled',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coursesService.remove(id);
  }
}
