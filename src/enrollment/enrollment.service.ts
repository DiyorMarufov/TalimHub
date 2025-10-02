import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { successRes } from '../utils/successRes';
import { errorCatch } from '../utils/errorRes';

@Injectable()
export class EnrollmentService {
  private readonly logger = new Logger(EnrollmentService.name);

  constructor(private readonly prisma: PrismaService) {}

  async enroll(createEnrollmentDto: CreateEnrollmentDto) {
    return this.prisma
      .$transaction(async (tx) => {
        try {
          const { studentId, courseId } = createEnrollmentDto;

          const student = await tx.student.findUnique({
            where: { id: studentId },
          });
          if (!student) throw new NotFoundException('Student not found');

          const course = await tx.course.findUnique({
            where: { id: courseId },
          });
          if (!course) throw new NotFoundException('Course not found');

          if (course.seatsAvailable <= 0) {
            throw new ConflictException('No seats available');
          }

          const existing = await tx.enrollment.findUnique({
            where: { studentId_courseId: { studentId, courseId } },
          });
          if (existing) {
            throw new ConflictException(
              'Student is already enrolled in this course',
            );
          }

          const newEnrollment = await tx.enrollment.create({
            data: { studentId, courseId, enrolledDate: new Date() },
          });

          await tx.course.update({
            where: { id: courseId },
            data: { seatsAvailable: { decrement: 1 } },
          });

          this.logger.log(
            `New enroll: studentId=${studentId}, courseId=${courseId}, time=${new Date().toISOString()}`,
          );

          return successRes(newEnrollment);
        } catch (error) {
          throw error;
        }
      })
      .catch((error) => errorCatch(error));
  }

  async complete(id: number) {
    try {
      const existsEnrollment = await this.prisma.enrollment.findUnique({
        where: { id },
      });

      if (!existsEnrollment) {
        throw new NotFoundException(`Enrollment with ${id} not found`);
      }

      const enrollmentDate = await this.prisma.enrollment.update({
        where: { id },
        data: { completed: true, completionDate: new Date() },
      });

      this.logger.log(
        `Completion: studentId=${enrollmentDate.studentId}, courseId=${enrollmentDate.courseId}, time=${new Date().toISOString()}`,
      );
      return successRes(enrollmentDate);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async unenroll(id: number) {
    return this.prisma
      .$transaction(async (tx) => {
        try {
          const existsEnrollment = await tx.enrollment.findUnique({
            where: { id },
          });
          if (!existsEnrollment) {
            throw new NotFoundException(`Enrollment with ${id} not found`);
          }

          await tx.enrollment.delete({ where: { id } });

          await tx.course.update({
            where: { id: existsEnrollment.courseId },
            data: { seatsAvailable: { increment: 1 } },
          });

          this.logger.log(
            `Unenroll: studentId=${existsEnrollment.studentId}, courseId=${existsEnrollment.courseId}, time=${new Date().toISOString()}`,
          );
          return successRes({}, 200, 'Unenrolled successfully');
        } catch (error) {
          throw error;
        }
      })
      .catch((error) => errorCatch(error));
  }

  async activeEnrollments() {
    try {
      const enrollments = await this.prisma.enrollment.findMany({
        where: { completed: false },
        include: {
          course: true,
          student: true,
        },
      });

      return successRes(enrollments);
    } catch (error) {
      return errorCatch(error);
    }
  }
}
