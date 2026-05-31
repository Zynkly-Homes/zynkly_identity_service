import { Router }              from 'express';
import { authMiddleware }      from '../../middlewares/auth.middleware';
import { csrfMiddleware }      from '../../middlewares/csrf.middleware';
import { apiKeyMiddleware }    from '../../middlewares/api-key.middleware';
import { requirePermission }  from '../../middlewares/permission.middleware';
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

// GET  /bookings        → JWT + permission(view) + API key
router.get('/',
  authMiddleware,
  requirePermission('booking_management', 'view'),
  apiKeyMiddleware,
  getAllBookings,
);

// GET  /bookings/:id    → JWT + permission(view)
router.get('/:id',
  authMiddleware,
  requirePermission('booking_management', 'view'),
  getBookingById,
);

// POST /bookings        → JWT + CSRF + permission(create) + conditional API key
router.post('/',
  authMiddleware,
  csrfMiddleware,
  requirePermission('booking_management', 'create'),
  conditionalBookingCreateApiKey,
  createBooking,
);

// PATCH /bookings/:id   → JWT + CSRF + permission(edit) + conditional API key
router.patch('/:id',
  authMiddleware,
  csrfMiddleware,
  requirePermission('booking_management', 'edit'),
  conditionalBookingPatchApiKey,
  updateBooking,
);

// DELETE /bookings/:id  → JWT + CSRF + permission(delete) + API key
router.delete('/:id',
  authMiddleware,
  csrfMiddleware,
  requirePermission('booking_management', 'delete'),
  apiKeyMiddleware,
  deleteBooking,
);

export default router;
