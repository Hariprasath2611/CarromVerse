import { generateId } from '@carromverse/shared-utils';
import { BaseService } from '../../services/base.service.js';
import { AuthResponseDto, LoginRequestDto, RegisterRequestDto, UserProfileDto } from './auth.types.js';

export class AuthService extends BaseService {
  private users: Map<string, UserProfileDto> = new Map();

  constructor() {
    super('AuthService');
  }

  public async login(dto: LoginRequestDto): Promise<AuthResponseDto> {
    this.log(`Login attempt for ${dto.email}`);
    let user = Array.from(this.users.values()).find((u) => u.email === dto.email);
    if (!user) {
      user = {
        id: generateId('usr'),
        email: dto.email,
        username: dto.email.split('@')[0],
        createdAt: new Date().toISOString(),
      };
      this.users.set(user.id, user);
    }

    return {
      token: `cv_token_${user.id}_${Date.now()}`,
      user,
    };
  }

  public async register(dto: RegisterRequestDto): Promise<AuthResponseDto> {
    this.log(`Registration for ${dto.username}`);
    const user: UserProfileDto = {
      id: generateId('usr'),
      email: dto.email,
      username: dto.username,
      createdAt: new Date().toISOString(),
    };
    this.users.set(user.id, user);

    return {
      token: `cv_token_${user.id}_${Date.now()}`,
      user,
    };
  }
}

