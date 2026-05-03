import { IGenericRepository } from './generic-repository.abstract';
import { IStudentDocument }   from '../entities/student.entity';
import { IMarksDocument }     from '../entities/marks.entity';
import { IModuleDocument }    from '../entities/module.entity';
import { IRoleDocument }      from '../entities/role.entity';
import { IUserDocument }      from '../entities/user.entity';
import { IApiKeyDocument }    from '../entities/api-key.entity';
import { IBookingDocument }   from '../entities/booking.entity';

export interface IDataServices {
  students: IGenericRepository<IStudentDocument>;
  marks:    IGenericRepository<IMarksDocument>;
  modules:  IGenericRepository<IModuleDocument>;
  roles:    IGenericRepository<IRoleDocument>;
  users:    IGenericRepository<IUserDocument>;
  apiKeys:  IGenericRepository<IApiKeyDocument>;
  bookings: IGenericRepository<IBookingDocument>;
}
