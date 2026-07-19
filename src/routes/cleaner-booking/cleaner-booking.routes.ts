import { Router }         from 'express';
import { csrfMiddleware } from '../../middlewares/csrf.middleware';
import { bookingAuth }    from '../../middlewares/booking-auth.middleware';
import {
  conditionalCleanerBookingCreateApiKey,
  conditionalCleanerBookingPatchApiKey,
} from '../../middlewares/conditional-cleaner-booking-api-key.middleware';
import {
  getAllCleanerBookings,
  getCleanerBookingById,
  createCleanerBooking,
  updateCleanerBooking,
  deleteCleanerBooking,
} from '../../controllers/cleaner-booking.controller';

const router = Router();

// GET  /cleaner-bookings        → JWT+permission(view)  OR  API key
router.get('/',
  bookingAuth('house_helper', 'view'),
  getAllCleanerBookings,
);

// GET  /cleaner-bookings/:id    → JWT+permission(view)  OR  API key
router.get('/:id',
  bookingAuth('house_helper', 'view'),
  getCleanerBookingById,
);

// POST /cleaner-bookings        → JWT+CSRF+permission(create) OR API key; then conditional API key for initial payments
router.post('/',
  bookingAuth('house_helper', 'create'),
  csrfMiddleware,
  conditionalCleanerBookingCreateApiKey,
  createCleanerBooking,
);

// PATCH /cleaner-bookings/:id   → JWT+CSRF+permission(edit) OR API key; then conditional API key for profile fields
router.patch('/:id',
  bookingAuth('house_helper', 'edit'),
  csrfMiddleware,
  conditionalCleanerBookingPatchApiKey,
  updateCleanerBooking,
);

// DELETE /cleaner-bookings/:id  → JWT+CSRF+permission(delete)  OR  API key
router.delete('/:id',
  bookingAuth('house_helper', 'delete'),
  csrfMiddleware,
  deleteCleanerBooking,
);

export default router;
