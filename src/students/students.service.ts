import { ConflictException, Injectable } from '@nestjs/common';
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
    return `This action returns all students`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} student`;
  }
}
