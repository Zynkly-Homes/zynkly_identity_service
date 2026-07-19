import { Router }         from 'express';
import { csrfMiddleware } from '../../middlewares/csrf.middleware';
import { bookingAuth }    from '../../middlewares/booking-auth.middleware';
import { bookingActivityLogger } from '../../middlewares/booking-activity-logger.middleware';
import {
  conditionalBookingCreateApiKey,
  conditionalBookingPatchApiKey,
} from '../../middlewares/conditional-api-key.middleware';
import {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  deleteBooking,
} from '../../controllers/booking.controller';

const router = Router();

// GET  /bookings        → JWT+permission(view)  OR  API key
router.get('/',
  bookingActivityLogger,
  bookingAuth('booking_management', 'view'),
  getAllBookings,
);

// GET  /bookings/:id    → JWT+permission(view)  OR  API key
router.get('/:id',
  bookingActivityLogger,
  bookingAuth('booking_management', 'view'),
  getBookingById,
);

// POST /bookings        → JWT+CSRF+permission(create) OR API key; then conditional API key for whatsapp_to_crm
// csrfMiddleware skips automatically when req.sessionCsrfToken is absent (API-key-only path)
router.post('/',
  bookingActivityLogger,
  bookingAuth('booking_management', 'create'),
  csrfMiddleware,
  conditionalBookingCreateApiKey,
  createBooking,
);

// PATCH /bookings/:id   → JWT+CSRF+permission(edit) OR API key; then conditional API key for operational fields
router.patch('/:id',
  bookingActivityLogger,
  bookingAuth('booking_management', 'edit'),
  csrfMiddleware,
  conditionalBookingPatchApiKey,
  updateBooking,
);

// DELETE /bookings/:id  → JWT+CSRF+permission(delete)  OR  API key
router.delete('/:id',
  bookingAuth('booking_management', 'delete'),
  csrfMiddleware,
  deleteBooking,
);

export default router;
