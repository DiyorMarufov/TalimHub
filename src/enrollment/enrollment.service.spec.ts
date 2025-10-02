import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentService } from './enrollment.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

jest.mock('../utils/errorRes', () => ({
  errorCatch: (err: any) => {
    throw err;
  },
}));

describe('EnrollmentService', () => {
  let service: EnrollmentService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnrollmentService, PrismaService],
    }).compile();

    service = module.get<EnrollmentService>(EnrollmentService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('enroll', () => {
    it('should enroll successfully if seats available', async () => {
      const dto = { studentId: 1, courseId: 1 };

      prisma.student.findUnique = jest.fn().mockResolvedValue({ id: 1 });
      prisma.course.findUnique = jest
        .fn()
        .mockResolvedValue({ id: 1, seatsAvailable: 5 });
      prisma.enrollment.findUnique = jest.fn().mockResolvedValue(null);
      prisma.enrollment.create = jest.fn().mockResolvedValue({ id: 1, ...dto });
      prisma.course.update = jest.fn().mockResolvedValue({});

      prisma.$transaction = jest.fn().mockImplementation((cb) =>
        cb({
          student: prisma.student,
          course: prisma.course,
          enrollment: prisma.enrollment,
        }),
      );

      const result = await service.enroll(dto);
      expect(result.data.id).toBe(1);
    });

    it('should fail if course is full', async () => {
      const dto = { studentId: 1, courseId: 1 };

      prisma.student.findUnique = jest.fn().mockResolvedValue({ id: 1 });
      prisma.course.findUnique = jest
        .fn()
        .mockResolvedValue({ id: 1, seatsAvailable: 0 });
      prisma.enrollment.findUnique = jest.fn().mockResolvedValue(null);

      prisma.$transaction = jest.fn().mockImplementation((cb) =>
        cb({
          student: prisma.student,
          course: prisma.course,
          enrollment: prisma.enrollment,
        }),
      );

      await expect(service.enroll(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('unenroll', () => {
    it('should unenroll successfully', async () => {
      const enrollment = { id: 1, studentId: 1, courseId: 1 };
      prisma.enrollment.findUnique = jest.fn().mockResolvedValue(enrollment);
      prisma.enrollment.delete = jest.fn().mockResolvedValue(enrollment);
      prisma.course.update = jest.fn().mockResolvedValue({});

      prisma.$transaction = jest.fn().mockImplementation((cb) =>
        cb({
          enrollment: prisma.enrollment,
          course: prisma.course,
        }),
      );

      const result = await service.unenroll(1);
      expect(result.message).toBe('Unenrolled successfully');
    });
  });

  describe('complete', () => {
    it('should complete enrollment successfully', async () => {
      const enrollment = { id: 1, studentId: 1, courseId: 1, completed: false };
      prisma.enrollment.findUnique = jest.fn().mockResolvedValue(enrollment);
      prisma.enrollment.update = jest
        .fn()
        .mockResolvedValue({ ...enrollment, completed: true });

      const result = await service.complete(1);
      expect(result.data.completed).toBe(true);
    });

    it('should throw NotFoundException if enrollment not found', async () => {
      prisma.enrollment.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.complete(1)).rejects.toThrow(NotFoundException);
    });
  });
});
