import { IDataServices }         from '../../core/abstracts/data-service.abstract';
import { CreateCleanerBookingDto } from '../../core/dtos/cleaner-booking/create-cleaner-booking.dto';
import { UpdateCleanerBookingDto } from '../../core/dtos/cleaner-booking/update-cleaner-booking.dto';
import { AppError }              from '../../utils/app-error.util';
import { ListQuery, parsePagination, buildPageResult } from '../../utils/pagination.util';
import { Counter }                from '../../frameworks/mongo/model/counter.model';

// ─── Reference ID helpers ────────────────────────────────────────────────────

/**
 * Encodes a sequential counter into the suffix portion of the reference_id.
 *
 * 1 – 99999   →  "00001" – "99999"   (5-digit zero-padded)
 * 100000+     →  "A0001", "A0002" … "A9999", "B0001" …  (letter + 4-digit)
 */
function formatCounter(seq: number): string {
  if (seq <= 99999) return seq.toString().padStart(5, '0');
  const adjusted    = seq - 99999;                             // starts at 1
  const letterIndex = Math.floor((adjusted - 1) / 9999);      // 0=A, 1=B …
  const num         = ((adjusted - 1) % 9999) + 1;            // 1-9999
  return String.fromCharCode(65 + letterIndex) + num.toString().padStart(4, '0');
}

async function generateReferenceId(): Promise<string> {
  const now  = new Date();
  const dd   = now.getDate().toString().padStart(2, '0');
  const mm   = (now.getMonth() + 1).toString().padStart(2, '0');
  const yyyy = now.getFullYear().toString();

  // Atomic increment — safe under concurrent requests
  const counter = await Counter.findOneAndUpdate(
    { _id: 'cleaner_booking_reference' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  return `CB-${dd}-${mm}-${yyyy}-${formatCounter(counter!.seq)}`;
}

// ─── Use-case ────────────────────────────────────────────────────────────────

export class CleanerBookingUseCase {
  constructor(private readonly dataServices: IDataServices) {}

  /**
   * List cleaner bookings with optional search / pagination.
   *
   * Query params:
   *   page, limit — pagination
   *   search      — case-insensitive match on cleaner_name, cleaner_id, mobile_number, reference_id
   *   is_active   — "true" | "false" (default: true)
   *   is_delete   — "true" | "false" (default: false)
   */
  async getAllCleanerBookings(query: ListQuery = {}) {
    const { pageNum, limitNum, hasPagination } = parsePagination(query);

    const match: Record<string, unknown> = {};

    match['is_active'] = query['is_active'] !== undefined
      ? query['is_active'] === 'true'
      : true;

    // Use $ne rather than strict `false` so documents predating the is_delete
    // field (which have no is_delete key stored at all) are still included —
    // aggregate() reads raw Mongo docs and does not apply Mongoose schema defaults.
    match['is_delete'] = query['is_delete'] === 'true' ? true : { $ne: true };

    if (query['search']) {
      const regex = { $regex: query['search'], $options: 'i' };
      match['$or'] = [
        { cleaner_name:  regex },
        { cleaner_id:    regex },
        { mobile_number: regex },
        { reference_id:  regex },
      ];
    }

    const pipeline = [{ $match: match }];

    if (hasPagination) {
      return this.dataServices.cleanerBookings.aggregateWithPagination(pipeline, pageNum, limitNum);
    }

    const data = await this.dataServices.cleanerBookings.aggregate(pipeline) as Record<string, unknown>[];
    return buildPageResult(data, data.length, 1, data.length || 1);
  }

  async getCleanerBookingById(id: string) {
    const cleanerBooking = await this.dataServices.cleanerBookings.get(id);
    if (!cleanerBooking || cleanerBooking.is_delete) throw new AppError('Cleaner booking not found', 404);
    return cleanerBooking;
  }

  async createCleanerBooking(dto: CreateCleanerBookingDto) {
    const reference_id = await generateReferenceId();
    return this.dataServices.cleanerBookings.create({
      cleaner_id:    dto.cleaner_id    || 'N/A',
      cleaner_name:  dto.cleaner_name  || 'N/A',
      joined_at:     dto.joined_at,
      address:       dto.address       || 'N/A',
      mobile_number: dto.mobile_number || 'N/A',
      payments:      dto.payments ?? [],
      reference_id,
      is_active:     dto.is_active ?? true,
      is_delete:     false,
    });
  }

  /**
   * Update a cleaner booking.
   *
   * isAdmin = true  → caller provided a valid API key; any field can be changed.
   * isAdmin = false → caller has JWT only; may only append payment entries
   *                   (`new_payment` / `payments`) — cleaner profile fields require API key.
   */
  async updateCleanerBooking(id: string, dto: UpdateCleanerBookingDto, isAdmin: boolean) {
    const cleanerBooking = await this.dataServices.cleanerBookings.get(id);
    if (!cleanerBooking) throw new AppError('Cleaner booking not found', 404);

    const update: Record<string, unknown> = {};

    if (!isAdmin) {
      // Non-admin users may only append payment entries
      const allowedKeys = new Set(['new_payment', 'payments']);
      const attempted   = Object.keys(dto).filter(k => !allowedKeys.has(k));
      if (attempted.length > 0) {
        throw new AppError(
          `Permission denied — cannot update field(s): ${attempted.join(', ')}. Requires API key.`,
          403,
        );
      }
    }

    const fieldKeys: (keyof UpdateCleanerBookingDto)[] = [
      'cleaner_id', 'cleaner_name', 'joined_at', 'address', 'mobile_number',
      'is_active', 'is_delete',
    ];
    for (const key of fieldKeys) {
      if (dto[key] !== undefined) update[key] = dto[key];
    }

    // Both single (`new_payment`) and batch (`payments`) entries append to the same array
    const newEntries = [...(dto.new_payment ? [dto.new_payment] : []), ...(dto.payments ?? [])];
    if (newEntries.length > 0) {
      // Use $push/$each so we don't overwrite existing payment history
      await this.dataServices.cleanerBookings.updateMany(
        { _id: cleanerBooking._id },
        { $push: { payments: { $each: newEntries } }, ...update },
      );
      return this.dataServices.cleanerBookings.get(id);
    }

    return this.dataServices.cleanerBookings.update(id, update);
  }

  async deleteCleanerBooking(id: string) {
    const cleanerBooking = await this.dataServices.cleanerBookings.get(id);
    if (!cleanerBooking || cleanerBooking.is_delete) throw new AppError('Cleaner booking not found', 404);
    await this.dataServices.cleanerBookings.update(id, { is_delete: true });
  }
}
