import bcrypt            from 'bcryptjs';
import jwt               from 'jsonwebtoken';
import { Types }         from 'mongoose';
import { IDataServices } from '../../core/abstracts/data-service.abstract';
import { LoginDto }      from '../../core/dtos/user/login.dto';
import { IJwtPayload }   from '../../core/entities/user.entity';
import { AppError }      from '../../utils/app-error.util';
import { DEFAULT_JWT_EXPIRY } from '../../utils/constants';

export class AuthUseCase {
  constructor(private readonly dataServices: IDataServices) {}

  async login(dto: LoginDto): Promise<{ token: string; user: IJwtPayload }> {
    console.log(`[AUTH] login attempt: ${dto.email}`);
    const user = await this.dataServices.users.findOne({ email: dto.email });
    console.log(`[AUTH] user found: ${!!user}`);

    // Same 401 message for "no such user" and "wrong password" — prevents user enumeration
    if (!user) throw new AppError('Invalid email or password.', 401);

    // Separate explicit message for inactive accounts (user already knows they exist)
    if (!user.is_active) {
      throw new AppError('Your account has been deactivated. Please contact the administrator.', 401);
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) throw new AppError('Invalid email or password.', 401);

    const payload: IJwtPayload = {
      user_id: (user._id as unknown as Types.ObjectId).toString(),
      email:   user.email,
      role_id: user.role_id.toString(),
    };

    const secret  = process.env['JWT_SECRET'] ?? 'change_me';
    const expires = process.env['JWT_EXPIRES_IN'] ?? DEFAULT_JWT_EXPIRY;
    const token   = jwt.sign(payload, secret, { expiresIn: expires } as jwt.SignOptions);

    return { token, user: payload };
  }

  async getProfile(userId: string) {
    const [user] = await this.dataServices.users.aggregate([
      { $match: { _id: new Types.ObjectId(userId) } },
      { $lookup: { from: 'roles', localField: 'role_id', foreignField: '_id', as: 'role' } },
      { $unwind: { path: '$role', preserveNullAndEmptyArrays: true } },
      { $project: { password: 0 } },
    ]);
    if (!user) throw new AppError('User not found', 404);
    return user;
  }
}
