import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { CoursesModule } from './courses/courses.module';
import { EnrollmentModule } from './enrollment/enrollment.module';
import { StudentsModule } from './students/students.module';
import { InstructorsModule } from './instructors/instructors.module';
import { InstructorsModule } from './instructors/instructors.module';
import { CoursesModule } from './courses/courses.module';

@Module({
  imports: [CoursesModule, InstructorsModule, StudentsModule, EnrollmentModule],
  providers: [PrismaService],
})
export class AppModule {}
