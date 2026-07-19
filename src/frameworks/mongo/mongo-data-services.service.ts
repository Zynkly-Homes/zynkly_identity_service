import { IDataServices }            from '../../core/abstracts/data-service.abstract';
import { IStudentDocument }          from '../../core/entities/student.entity';
import { IMarksDocument }            from '../../core/entities/marks.entity';
import { IModuleDocument }           from '../../core/entities/module.entity';
import { IRoleDocument }             from '../../core/entities/role.entity';
import { IUserDocument }             from '../../core/entities/user.entity';
import { IApiKeyDocument }           from '../../core/entities/api-key.entity';
import { IBookingDocument }          from '../../core/entities/booking.entity';
import { ICleanerBookingDocument }   from '../../core/entities/cleaner-booking.entity';
import { IBookingActivityLogDocument } from '../../core/entities/booking-activity-log.entity';
import { IGenericRepository }        from '../../core/abstracts/generic-repository.abstract';
import { Student }                   from './model/student.model';
import { Marks }                     from './model/marks.model';
import { Module }                    from './model/module.model';
import { Role }                      from './model/role.model';
import { User }                      from './model/user.model';
import { ApiKey }                    from './model/api-key.model';
import { Booking }                   from './model/booking.model';
import { CleanerBooking }            from './model/cleaner-booking.model';
import { BookingActivityLog }        from './model/booking-activity-log.model';
import { MongoGenericRepository }    from './mongo-generic-repository';

export class MongoDataServices implements IDataServices {
  students:            IGenericRepository<IStudentDocument>;
  marks:               IGenericRepository<IMarksDocument>;
  modules:             IGenericRepository<IModuleDocument>;
  roles:               IGenericRepository<IRoleDocument>;
  users:               IGenericRepository<IUserDocument>;
  apiKeys:             IGenericRepository<IApiKeyDocument>;
  bookings:            IGenericRepository<IBookingDocument>;
  cleanerBookings:     IGenericRepository<ICleanerBookingDocument>;
  bookingActivityLogs: IGenericRepository<IBookingActivityLogDocument>;

  constructor() {
    this.students            = new MongoGenericRepository<IStudentDocument>(Student);
    this.marks               = new MongoGenericRepository<IMarksDocument>(Marks);
    this.modules             = new MongoGenericRepository<IModuleDocument>(Module);
    this.roles               = new MongoGenericRepository<IRoleDocument>(Role);
    this.users               = new MongoGenericRepository<IUserDocument>(User);
    this.apiKeys             = new MongoGenericRepository<IApiKeyDocument>(ApiKey);
    this.bookings            = new MongoGenericRepository<IBookingDocument>(Booking);
    this.cleanerBookings     = new MongoGenericRepository<ICleanerBookingDocument>(CleanerBooking);
    this.bookingActivityLogs = new MongoGenericRepository<IBookingActivityLogDocument>(BookingActivityLog);
  }
}
