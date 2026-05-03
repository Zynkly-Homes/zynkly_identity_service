import { AppError }        from '../../utils/app-error.util';
import { IDataServices }    from '../../core/abstracts/data-service.abstract';
import { CreateStudentDto } from '../../core/dtos/student/create-student.dto';
import { UpdateStudentDto } from '../../core/dtos/student/update-student.dto';

/**
 * StudentUseCase — All business rules for the Student domain.
 *
 * Rule: No Mongoose or Express imports. Only IDataServices.
 * Controllers call these methods; they never touch the DB directly.
 */
export class StudentUseCase {
  constructor(private readonly dataServices: IDataServices) {}

  /** List with optional search / filter / pagination */
  async getAllStudents(query: Record<string, string> = {}) {
    const { page, limit, search, grade, is_active } = query;

    const filter: Record<string, unknown> = {};
    if (is_active !== undefined) filter['is_active'] = is_active === 'true';
    if (grade) filter['grade'] = grade;
    if (search) {
      filter['$or'] = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (page && limit) {
      const pageNum  = parseInt(page,  10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
      const skip     = (pageNum - 1) * limitNum;

      const [data, total] = await Promise.all([
        this.dataServices.students.findWithPagination(filter, skip, limitNum, { createdAt: -1 }),
        this.dataServices.students.count(filter),
      ]);
      return { data, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) };
    }

    const data = await this.dataServices.students.find(filter);
    return { data, total: data.length };
  }

  async getStudentById(id: string) {
    const student = await this.dataServices.students.get(id);
    if (!student) throw new AppError('Student not found', 404);
    return student;
  }

  async createStudent(dto: CreateStudentDto) {
    const existing = await this.dataServices.students.findUnique({ email: dto.email });
    if (existing) throw new AppError('A student with this email already exists', 409);
    return this.dataServices.students.create(dto);
  }

  async updateStudent(id: string, dto: UpdateStudentDto) {
    const student = await this.dataServices.students.get(id) as ({ email: string } | null);
    if (!student) throw new AppError('Student not found', 404);

    if (dto.email && dto.email !== student.email) {
      const taken = await this.dataServices.students.findUnique({ email: dto.email });
      if (taken) throw new AppError('Email is already taken by another student', 409);
    }
    return this.dataServices.students.update(id, dto);
  }

  async deleteStudent(id: string) {
    const student = await this.dataServices.students.get(id);
    if (!student) throw new AppError('Student not found', 404);
    return this.dataServices.students.delete(id);
  }

  async deactivateStudent(id: string) {
    const student = await this.dataServices.students.get(id);
    if (!student) throw new AppError('Student not found', 404);
    return this.dataServices.students.update(id, { is_active: false });
  }

  /**
   * Grade summary via MongoDB aggregation.
   * $group groups all matching documents by the 'grade' field, then
   *   $sum: 1   → increments a counter for each document in the group
   *   $avg: ... → computes average age within each group
   */
  async getGradeSummary() {
    return this.dataServices.students.aggregate([
      { $match: { is_active: true } },
      {
        $group: {
          _id:    '$grade',
          count:  { $sum: 1 },
          avgAge: { $avg: '$age' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }
}
