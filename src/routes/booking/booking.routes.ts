import { Router }              from 'express';
import { authMiddleware }      from '../../middlewares/auth.middleware';
import { apiKeyMiddleware }    from '../../middlewares/api-key.middleware';
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

// GET  /bookings        → JWT + API key  (CRM / admin list)
router.get('/',     authMiddleware, apiKeyMiddleware,                  getAllBookings);

// GET  /bookings/:id    → JWT only       (user can view their own booking)
router.get('/:id',  authMiddleware,                                    getBookingById);

// POST /bookings        → JWT always; API key only if booking_via = whatsapp_to_crm
router.post('/',    authMiddleware, conditionalBookingCreateApiKey,    createBooking);

// PATCH /bookings/:id   → JWT always; API key only when changing non-status fields
router.patch('/:id', authMiddleware, conditionalBookingPatchApiKey,   updateBooking);

// DELETE /bookings/:id  → JWT + API key  (hard delete — admin only)
router.delete('/:id', authMiddleware, apiKeyMiddleware,               deleteBooking);

export default router;
