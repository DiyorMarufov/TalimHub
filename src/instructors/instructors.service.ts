import { ConflictException, Injectable } from '@nestjs/common';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { errorCatch } from 'src/utils/errorRes';
import { successRes } from 'src/utils/successRes';

@Injectable()
export class InstructorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createInstructorDto: CreateInstructorDto) {
    try {
      const existsEmail = await this.prisma.instructor.findUnique({
        where: { email: createInstructorDto.email },
      });

      if (existsEmail) {
        throw new ConflictException(
          `Instructor with email ${createInstructorDto.email} already exists`,
        );
      }
      const newInstructor = await this.prisma.instructor.create({
        data: createInstructorDto,
      });
      return successRes(newInstructor, 201);
    } catch (error) {
      return errorCatch(error);
    }
  }

  async findAll() {
    try {
      const instructors = await this.prisma.instructor.findMany();
      return successRes(instructors);
    } catch (error) {
      return errorCatch(error);
    }
  }
}
