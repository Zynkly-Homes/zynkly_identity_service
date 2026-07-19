import { IDataServices }      from '../../core/abstracts/data-service.abstract';
import { CreateBookingDto }    from '../../core/dtos/booking/create-booking.dto';
import { UpdateBookingDto }    from '../../core/dtos/booking/update-booking.dto';
import { BookingStatus, BookingVia, PaymentMethod, PaymentStatus } from '../../core/entities/booking.entity';
import { AppError }            from '../../utils/app-error.util';
import { ListQuery, parsePagination, buildPageResult } from '../../utils/pagination.util';
import { Counter }             from '../../frameworks/mongo/model/counter.model';

// ─── Reference ID helpers ────────────────────────────────────────────────────

/**
 * Encodes a sequential counter into the suffix portion of the reference_id.
 *
 * 1 – 99999   →  "00001" – "99999"   (5-digit zero-padded)
 * 100000+     →  "A0001", "A0002" … "A9999", "B0001" …  (letter + 4-digit)
 *
 * Each letter bucket holds 9 999 values, giving 26 × 9 999 = 259 974 extra IDs
 * before overflow — more than enough for any realistic daily booking volume.
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
    { _id: 'booking_reference' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );

  return `${dd}-${mm}-${yyyy}-${formatCounter(counter!.seq)}`;
}

const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;

/**
 * Joins each booking with its assigned cleaner (booking.cleaner_id → CleanerBooking._id)
 * and flattens cleaner_name / mobile_number onto the top level of the booking document.
 * cleaner_id is stored as a plain string, so $convert (not localField/foreignField) is
 * used to safely cast it to ObjectId — non-ObjectId values (e.g. the "N/A" default)
 * simply fail to match rather than erroring, preserving LEFT JOIN semantics.
 */
function buildCleanerLookupStages(): object[] {
  return [
    {
      $lookup: {
        from: 'cleanerbookings',
        let:  { cleanerId: '$cleaner_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [
                  '$_id',
                  { $convert: { input: '$$cleanerId', to: 'objectId', onError: null, onNull: null } },
                ],
              },
            },
          },
          { $project: { cleaner_name: 1, mobile_number: 1 } },
        ],
        as: 'cleaner',
      },
    },
    { $unwind: { path: '$cleaner', preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        cleaner_name:          '$cleaner.cleaner_name',
        cleaner_mobile_number: '$cleaner.mobile_number',
      },
    },
    { $project: { cleaner: 0 } },
  ];
}

/** Builds an optional $sort stage from the `sort_by` query param. */
function buildBookingSortStage(sortBy: string | undefined): object[] {
  switch (sortBy) {
    case 'latest_updated':  return [{ $sort: { updatedAt: -1 } }];
    case 'oldest_updated':  return [{ $sort: { updatedAt: 1 } }];
    case 'latest_created':  return [{ $sort: { createdAt: -1 } }];
    case 'oldest_created':  return [{ $sort: { createdAt: 1 } }];
    default:                return [];
  }
}

// ─── Use-case ────────────────────────────────────────────────────────────────

export class BookingUseCase {
  constructor(private readonly dataServices: IDataServices) {}

  /**
   * List bookings with optional search / filter / pagination.
   *
   * Query params:
   *   page, limit       — pagination
   *   search            — case-insensitive match on user_name, user_phone, user_id, reference_id
   *   booking_status    — exact enum value
   *   booking_via       — exact enum value
   *   branch            — exact match
   *   payment_status    — exact enum value
   *   payment_method    — exact enum value
   *   cleaner_id        — exact match (assigned cleaner's CleanerBooking _id)
   *   user_id           — exact match
   *   reference_id      — exact match
   *   package_name      — exact match
   *   date_from         — ISO date; lower bound on createdAt
   *   date_to           — ISO date; upper bound on createdAt
   *   updated_from      — ISO date; lower bound on updatedAt
   *   updated_to        — ISO date; upper bound on updatedAt
   *   is_active         — "true" | "false" (default: true)
   *   is_delete         — "true" | "false" (default: false)
   *   sort_by           — "latest_updated" | "oldest_updated" | "latest_created" | "oldest_created"
   *                       (default: unsorted / natural insertion order)
   */
  async getAllBookings(query: ListQuery = {}) {
    const { pageNum, limitNum, hasPagination } = parsePagination(query);

    const match: Record<string, unknown> = {};

    // Default: only active bookings unless caller explicitly asks for inactive
    match['is_active'] = query['is_active'] !== undefined
      ? query['is_active'] === 'true'
      : true;

    // Exclude soft-deleted bookings unless caller explicitly asks for them.
    // Use $ne rather than strict `false` so documents predating the is_delete
    // field (which have no is_delete key stored at all) are still included —
    // aggregate() reads raw Mongo docs and does not apply Mongoose schema defaults.
    match['is_delete'] = query['is_delete'] === 'true' ? true : { $ne: true };

    if (query['booking_status'])   match['booking_status']   = query['booking_status'];
    if (query['booking_via'])      match['booking_via']      = query['booking_via'];
    if (query['branch'])           match['branch']           = query['branch'];
    if (query['payment_status'])   match['payment_status']   = query['payment_status'];
    if (query['payment_method'])   match['payment_method']   = query['payment_method'];
    if (query['cleaner_id'])       match['cleaner_id']       = query['cleaner_id'];
    if (query['user_id'])          match['user_id']          = query['user_id'];
    if (query['reference_id'])     match['reference_id']     = query['reference_id'];
    if (query['package_name'])     match['package_name']     = query['package_name'];

    // Date range on createdAt
    if (query['date_from'] || query['date_to']) {
      const range: Record<string, Date> = {};
      if (query['date_from']) range['$gte'] = new Date(query['date_from']);
      if (query['date_to']) {
        const to = new Date(query['date_to']);
        to.setHours(23, 59, 59, 999);  // include full day
        range['$lte'] = to;
      }
      match['createdAt'] = range;
    }

    // Date range on updatedAt — filter bookings by when they were last modified
    if (query['updated_from'] || query['updated_to']) {
      const range: Record<string, Date> = {};
      if (query['updated_from']) range['$gte'] = new Date(query['updated_from']);
      if (query['updated_to']) {
        const to = new Date(query['updated_to']);
        to.setHours(23, 59, 59, 999);  // include full day
        range['$lte'] = to;
      }
      match['updatedAt'] = range;
    }

    // Text search across key identifier fields
    if (query['search']) {
      const regex = { $regex: query['search'], $options: 'i' };
      match['$or'] = [
        { user_name:    regex },
        { user_phone:   regex },
        { user_id:      regex },
        { reference_id: regex },
      ];
    }

    const sortStage = buildBookingSortStage(query['sort_by']);
    const pipeline  = [{ $match: match }, ...buildCleanerLookupStages(), ...sortStage];

    if (hasPagination) {
      return this.dataServices.bookings.aggregateWithPagination(pipeline, pageNum, limitNum);
    }

    const data = await this.dataServices.bookings.aggregate(pipeline) as Record<string, unknown>[];
    return buildPageResult(data, data.length, 1, data.length || 1);
  }

  async getBookingById(id: string) {
    const booking = await this.dataServices.bookings.get(id);
    if (!booking || booking.is_delete) throw new AppError('Booking not found', 404);

    const cleaner = booking.cleaner_id && OBJECT_ID_RE.test(booking.cleaner_id)
      ? await this.dataServices.cleanerBookings.get(booking.cleaner_id)
      : null;
    return {
      ...(booking as unknown as Record<string, unknown>),
      cleaner_name:          cleaner?.cleaner_name ?? null,
      cleaner_mobile_number: cleaner?.mobile_number ?? null,
    };
  }

  async createBooking(dto: CreateBookingDto) {
    const reference_id = await generateReferenceId();
    return this.dataServices.bookings.create({
      branch:            dto.branch            || 'N/A',
      user_name:         dto.user_name         || 'N/A',
      user_id:           dto.user_id           || 'N/A',
      user_phone:        dto.user_phone        || 'N/A',
      address:           dto.address           || 'N/A',
      live_location_url: dto.live_location_url || 'N/A',
      house_helper_name: dto.house_helper_name || 'N/A',
      cleaner_id:        dto.cleaner_id        || 'N/A',
      booking_via:       dto.booking_via       || BookingVia.CALL,
      booking_created_date_and_time: dto.booking_created_date_and_time,
      package_name:      dto.package_name      || 'N/A',
      payment_method:    dto.payment_method    || PaymentMethod.CASH,
      payment_amount:    dto.payment_amount    ?? 0,
      payment_status:    dto.payment_status    || PaymentStatus.PENDING,
      reference_id,
      booking_status:    BookingStatus.ONGOING,
      cancellation_log:  [],
      is_active:         true,
      is_delete:         false,
    });
  }

  /**
   * Update a booking.
   *
   * isAdmin = true  → caller provided a valid API key; any field can be changed.
   * isAdmin = false → caller has JWT only; may only set booking_status to
   *                   "cancelled_via_user" and/or update cancellation_reason.
   *
   * Cancellation tracking: whenever booking_status is set to a cancelled value,
   * a log entry is automatically appended to cancellation_log.
   */
  async updateBooking(id: string, dto: UpdateBookingDto, isAdmin: boolean, requesterId: string) {
    const booking = await this.dataServices.bookings.get(id);
    if (!booking) throw new AppError('Booking not found', 404);

    const update: Record<string, unknown> = {};

    if (!isAdmin) {
      // Non-admin users may only cancel and provide a reason
      const allowedKeys = new Set(['booking_status', 'cancellation_reason']);
      const attempted   = Object.keys(dto).filter(k => !allowedKeys.has(k));
      if (attempted.length > 0) {
        throw new AppError(
          `Permission denied — cannot update field(s): ${attempted.join(', ')}. Requires API key.`,
          403,
        );
      }
      // Non-admin can only cancel as "cancelled_via_user"
      if (dto.booking_status && dto.booking_status !== BookingStatus.CANCELLED_VIA_USER) {
        throw new AppError(
          `Permission denied — you can only set booking_status to "${BookingStatus.CANCELLED_VIA_USER}".`,
          403,
        );
      }
    }

    // Copy all allowed fields into the update
    const fieldKeys: (keyof UpdateBookingDto)[] = [
      'branch', 'user_name', 'user_id', 'user_phone',
      'address', 'live_location_url', 'house_helper_name', 'cleaner_id', 'booking_via',
      'booking_status', 'cancellation_reason',
      'package_name', 'payment_method', 'payment_amount', 'payment_status',
      'is_active', 'is_delete',
    ];
    for (const key of fieldKeys) {
      if (dto[key] !== undefined) update[key] = dto[key];
    }

    // Auto-append cancellation log when status changes to a cancelled value
    const cancelledStatuses = [BookingStatus.CANCELLED_VIA_USER, BookingStatus.CANCELLED_BY_ADMIN];
    if (dto.booking_status && cancelledStatuses.includes(dto.booking_status)) {
      const logEntry = {
        booking_status: dto.booking_status,
        cancelled_by:   requesterId,
        cancelled_at:   new Date(),
      };
      // Use $push so we don't overwrite existing log entries
      await this.dataServices.bookings.updateMany(
        { _id: booking._id },
        { $push: { cancellation_log: logEntry }, ...update },
      );
      return this.dataServices.bookings.get(id);
    }

    return this.dataServices.bookings.update(id, update);
  }

  async deleteBooking(id: string) {
    const booking = await this.dataServices.bookings.get(id);
    if (!booking || booking.is_delete) throw new AppError('Booking not found', 404);
    await this.dataServices.bookings.update(id, { is_delete: true });
  }
}
