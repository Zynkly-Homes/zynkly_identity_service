import { Router }      from 'express';
import { bookingAuth } from '../../middlewares/booking-auth.middleware';
import { getAllBookingActivityLogs } from '../../controllers/booking-activity-log.controller';

const router = Router();

// GET /booking-activity-logs → JWT+permission(view) OR API key
router.get('/',
  bookingAuth('booking_management', 'view'),
  getAllBookingActivityLogs,
);

export default router;
