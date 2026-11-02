export interface UserProfileDto {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

export interface LoginRequestDto {
  email: string;
  password?: string;
}

export interface RegisterRequestDto {
  email: string;
  username: string;
  password?: string;
}

export interface AuthResponseDto {
  token: string;
  user: UserProfileDto;
}

