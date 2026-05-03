import { Types }           from 'mongoose';
import { AppError }        from '../../utils/app-error.util';
import { IDataServices }   from '../../core/abstracts/data-service.abstract';
import { CreateMarksDto }  from '../../core/dtos/marks/create-marks.dto';
import { UpdateMarksDto }  from '../../core/dtos/marks/update-marks.dto';

/** Computed result fields — derived from raw subject marks */
interface ComputedResult {
  total:        number;
  percentage:   number;
  result_grade: string;
}

/**
 * MarksUseCase — All business rules for the Marks domain.
 *
 * Key design decisions:
 *  - One marks record per student (enforced by unique index on student_id in schema)
 *  - total / percentage / result_grade computed HERE in the use-case, not in DB hooks,
 *    so the logic is testable without a database
 *  - Lookup (join student info) is done via MongoDB $lookup aggregation pipeline
 */
export class MarksUseCase {
  constructor(private readonly dataServices: IDataServices) {}

  /**
   * Compute total marks, percentage, and letter grade from raw subject scores.
   * Max total = 500 (5 subjects × 100 each).
   *
   * Grade scale:
   *   A+: 90%+   A: 80–89%   B: 70–79%   C: 60–69%   D: 50–59%   F: <50%
   */
  private computeResult(scores: Pick<CreateMarksDto, 'hindi' | 'english' | 'math' | 'science' | 'sst'>): ComputedResult {
    const total      = scores.hindi + scores.english + scores.math + scores.science + scores.sst;
    const percentage = parseFloat(((total / 500) * 100).toFixed(2));

    let result_grade = 'F';
    if (percentage >= 90)      result_grade = 'A+';
    else if (percentage >= 80) result_grade = 'A';
    else if (percentage >= 70) result_grade = 'B';
    else if (percentage >= 60) result_grade = 'C';
    else if (percentage >= 50) result_grade = 'D';

    return { total, percentage, result_grade };
  }

  /**
   * Build the standard aggregation pipeline that joins marks with student info.
   *
   * $lookup: MongoDB LEFT JOIN equivalent.
   *   from: 'students'   → target collection (Mongoose lowercases + pluralizes 'Student')
   *   localField:        → field in the marks collection holding the foreign key
   *   foreignField: _id  → field in students collection to match against
   *   as: 'student'      → name of the output array field on each document
   *
   * $unwind: Flattens the [student] array produced by $lookup into a single object.
   *   preserveNullAndEmptyArrays: true → keeps the marks doc even if the student
   *   was deleted (LEFT JOIN behaviour, not INNER JOIN).
   *
   * $project: Select and reshape fields for the API response.
   *   Flattens nested student.name etc. to the top level for cleaner JSON.
   */
  private buildMarksWithStudentPipeline(matchStage?: object) {
    const pipeline: object[] = [];

    if (matchStage) {
      pipeline.push({ $match: matchStage });
    }

    pipeline.push(
      // Step 1: Join students collection on marks.student_id = students._id
      {
        $lookup: {
          from:         'students',   // MongoDB collection name (auto-lowercased by Mongoose)
          localField:   'student_id', // FK in marks document
          foreignField: '_id',        // PK in students collection
          as:           'student',    // Output array field
        },
      },
      // Step 2: Flatten the array [ {student} ] → {student}
      // preserveNullAndEmptyArrays: true → don't drop marks if student was deleted
      {
        $unwind: {
          path:                       '$student',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Step 3: Reshape — flatten student fields to top level, remove nested student object
      {
        $project: {
          _id:          1,
          hindi:        1,
          english:      1,
          math:         1,
          science:      1,
          sst:          1,
          total:        1,
          percentage:   1,
          result_grade: 1,
          createdAt:    1,
          updatedAt:    1,
          // Flatten selected student fields directly into the response
          student: {
            _id:      '$student._id',
            name:     '$student.name',
            email:    '$student.email',
            grade:    '$student.grade',
            phone:    '$student.phone',
            is_active:'$student.is_active',
          },
        },
      }
    );

    return pipeline;
  }

  /** Get all marks with student info ($lookup), supports pagination */
  async getAllMarks(query: Record<string, string> = {}) {
    const { page, limit, student_id } = query;

    const matchStage: Record<string, unknown> = {};
    if (student_id) {
      matchStage['student_id'] = new Types.ObjectId(student_id);
    }

    const pipeline = this.buildMarksWithStudentPipeline(
      Object.keys(matchStage).length ? matchStage : undefined
    );

    if (page && limit) {
      const pageNum  = parseInt(page,  10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
      const skip     = (pageNum - 1) * limitNum;

      // $facet: run data-slice and count in ONE query
      const facetPipeline = [
        ...pipeline,
        {
          $facet: {
            data:       [{ $skip: skip }, { $limit: limitNum }],
            totalCount: [{ $count: 'total' }],  // Collapses to { total: N }
          },
        },
      ];

      const result = await this.dataServices.marks.aggregate(facetPipeline);
      const res    = result[0] as { data: unknown[]; totalCount: { total: number }[] };
      const data   = res?.data ?? [];
      const total  = res?.totalCount?.[0]?.total ?? 0;
      return { data, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) };
    }

    const data = await this.dataServices.marks.aggregate(pipeline);
    return { data, total: data.length };
  }

  /** Get one marks record by its own _id, with student info joined */
  async getMarksById(id: string) {
    const pipeline = this.buildMarksWithStudentPipeline({
      _id: new Types.ObjectId(id),
    });
    const result = await this.dataServices.marks.aggregate(pipeline);
    if (!result.length) throw new AppError('Marks not found', 404);
    return result[0];
  }

  /** Get marks for a specific student (by student_id), with student info */
  async getMarksByStudentId(studentId: string) {
    const pipeline = this.buildMarksWithStudentPipeline({
      student_id: new Types.ObjectId(studentId),
    });
    const result = await this.dataServices.marks.aggregate(pipeline);
    if (!result.length) throw new AppError('Marks not found for this student', 404);
    return result[0];
  }

  /** Create marks — validate student exists + no duplicate, then compute and save */
  async createMarks(dto: CreateMarksDto) {
    const student = await this.dataServices.students.get(dto.student_id);
    if (!student) throw new AppError('Student not found', 404);

    const alreadyExists = await this.dataServices.marks.findUnique({ student_id: dto.student_id });
    if (alreadyExists) throw new AppError('Marks already exist for this student', 409);

    const computed = this.computeResult(dto);
    return this.dataServices.marks.create({
      student_id: new Types.ObjectId(dto.student_id),
      hindi: dto.hindi, english: dto.english, math: dto.math, science: dto.science, sst: dto.sst,
      ...computed,
    });
  }

  /**
   * Update marks — find existing by marks _id, merge new values with existing,
   * recompute total/percentage/grade, then save.
   */
  async updateMarks(id: string, dto: UpdateMarksDto) {
    const existing = await this.dataServices.marks.get(id) as Record<string, unknown> | null;
    if (!existing) throw new AppError('Marks not found', 404);

    // Merge — keep old values for subjects not in the update dto
    const merged = {
      hindi:   (dto.hindi   ?? existing['hindi'])   as number,
      english: (dto.english ?? existing['english']) as number,
      math:    (dto.math    ?? existing['math'])    as number,
      science: (dto.science ?? existing['science']) as number,
      sst:     (dto.sst     ?? existing['sst'])     as number,
    };

    const computed = this.computeResult(merged);
    return this.dataServices.marks.update(id, { ...dto, ...computed });
  }

  async deleteMarks(id: string) {
    const marks = await this.dataServices.marks.get(id);
    if (!marks) throw new AppError('Marks not found', 404);
    return this.dataServices.marks.delete(id);
  }
}
