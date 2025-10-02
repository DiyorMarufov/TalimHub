import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { successRes } from 'src/utils/successRes';
import { errorCatch } from 'src/utils/errorRes';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createStudentDto: CreateStudentDto) {
    try {
      const existsEmail = await this.prisma.student.findUnique({
        where: { email: createStudentDto.email },
      });

      if (existsEmail) {
        throw new ConflictException(
          `Instructor with email ${createStudentDto.email} already exists`,
        );
      }
      const newInstructor = await this.prisma.student.create({
        data: createStudentDto,
      });
      return successRes(newInstructor, 201);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAll() {
    try {
      const students = await this.prisma.student.findMany();
      return successRes(students);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async enrollmentStudentHistory(id: number) {
    try {
      const students = await this.prisma.student.findUnique({
        where: { id },
        include: {
          enrollment: {
            include: {
              course: true,
            },
            orderBy: { enrolledDate: 'desc' },
          },
        },
      });

      if (!students) {
        throw new NotFoundException(`Student with ${id} not found`);
      }
      return successRes(students);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findOne(id: number) {
    try {
      const student = await this.prisma.student.findUnique({ where: { id } });

      if (!student) {
        throw new NotFoundException(`Student with ID ${id} not found`);
      }
      return successRes(student);
    } catch (error) {
      return errorCatch(error);
    }
  }
}
