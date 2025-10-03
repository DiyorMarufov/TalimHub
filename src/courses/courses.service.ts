import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { errorCatch } from 'src/utils/errorRes';
import { successRes } from 'src/utils/successRes';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

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

      this.logger.log(
        `Course created: courseId=${createdCourse.id}, time=${new Date().toISOString()}`,
      );
      return successRes(createdCourse, 201);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAll(status?: 'boshlanmagan' | 'davom' | 'tugagan') {
    try {
      const now = new Date();
      let where: any = {};

      if (status === 'boshlanmagan') {
        where.startDate = { gt: now };
      } else if (status === 'davom') {
        where.startDate = { lte: now };
        where.endDate = { gte: now };
      } else if (status === 'tugagan') {
        where.endDate = { lt: now };
      }

      const courses = await this.prisma.course.findMany({
        where,
        orderBy: { startDate: 'asc' },
      });

      return successRes(courses);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async enrolledCoursesByStudents(id: number) {
    try {
      const enrolledCourse = await this.prisma.course.findUnique({
        where: { id },
        include: {
          enrollment: {
            include: {
              student: true,
            },
          },
        },
      });
      if (!enrolledCourse) {
        throw new NotFoundException(`Course with ID ${id} not found`);
      }
      return successRes(enrolledCourse);
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

        if (updateCourseDto.capacity < enrolledCount) {
          throw new BadRequestException(
            `Cannot reduce capacity below number of enrolled students (${enrolledCount}).`,
          );
        }

        updateData.seatsAvailable = updateCourseDto.capacity - enrolledCount;
      }

      const updatedCourse = await this.prisma.course.update({
        where: { id },
        data: updateData,
      });

      this.logger.log(
        `Course updated: courseId=${id}, updatedFields=${Object.keys(
          updateData,
        ).join(',')}, time=${new Date().toISOString()}`,
      );
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
      this.logger.log(
        `Course deleted: courseId=${id}, time=${new Date().toISOString()}`,
      );
      await this.prisma.course.delete({ where: { id } });
      return successRes();
    } catch (error) {
      return errorCatch(error);
    }
  }
}
