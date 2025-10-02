import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { errorCatch } from 'src/utils/errorRes';
import { successRes } from 'src/utils/successRes';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createCourseDto: CreateCourseDto) {
    try {
      const newCourse = {
        ...createCourseDto,
        seatsAvailable: createCourseDto.capacity,
      };

      const createdCourse = await this.prisma.course.create({
        data: newCourse,
      });

      return successRes(createdCourse, 201);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAll() {
    try {
      const courses = await this.prisma.course.findMany();
      return successRes(courses);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findOne(id: number) {
    try {
      const existsCourse = await this.prisma.course.findUnique({
        where: { id },
      });

      if (!existsCourse) {
        throw new NotFoundException(`Course with ID ${id} not found`);
      }

      return successRes(existsCourse);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    try {
      const existsCourse = await this.prisma.course.findUnique({
        where: { id },
      });

      if (!existsCourse) {
        throw new NotFoundException(`Course with ID ${id} not found`);
      }

      const updateData: any = { ...updateCourseDto };

      if (updateCourseDto.capacity !== undefined) {
        const enrolledCount = await this.prisma.enrollment.count({
          where: { courseId: id },
        });

        const newCapacity = updateCourseDto.capacity;
        const newSeatsAvailable = newCapacity - enrolledCount;

        if (newSeatsAvailable < 0) {
          throw new BadRequestException(
            `Cannot reduce capacity below number of enrolled students (${enrolledCount}).`,
          );
        }

        updateData.seatsAvailable = newSeatsAvailable;
      }

      const updatedCourse = await this.prisma.course.update({
        where: { id },
        data: updateData,
      });

      return successRes(updatedCourse);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async remove(id: number) {
    try {
      const existsCourse = await this.prisma.course.findUnique({
        where: { id },
      });

      if (!existsCourse) {
        throw new NotFoundException(`Course with ID ${id} not found`);
      }

      const enrollments = await this.prisma.enrollment.findMany({
        where: { courseId: id },
      });
      if (enrollments.length > 0) {
        throw new BadRequestException(
          'Cannot delete this course because students are enrolled!',
        );
      }
      await this.prisma.course.delete({ where: { id } });
      return successRes();
    } catch (error) {
      return errorCatch(error);
    }
  }
}
