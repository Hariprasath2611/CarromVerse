import { HttpRequest, HttpResponse } from '../../middleware/types.js';
import { ResponseFormatter } from '../../utils/responseFormatter.js';
import { AuthService } from './auth.service.js';
import { AuthValidator } from './auth.validator.js';

export class AuthController {
  private authService: AuthService;

  constructor(authService = new AuthService()) {
    this.authService = authService;
  }

  public login = async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const validation = AuthValidator.validateLogin(req.body);
    if (!validation.isValid || !validation.data) {
      res.status(400).json(ResponseFormatter.error(validation.error || 'Validation error', 'VALIDATION_FAILED'));
      return;
    }

    try {
      const result = await this.authService.login(validation.data);
      res.status(200).json(ResponseFormatter.success(result));
    } catch (err) {
      res.status(500).json(ResponseFormatter.error('Login failed', 'AUTH_ERROR', err));
    }
  };

  public register = async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const validation = AuthValidator.validateRegister(req.body);
    if (!validation.isValid || !validation.data) {
      res.status(400).json(ResponseFormatter.error(validation.error || 'Validation error', 'VALIDATION_FAILED'));
      return;
    }

    try {
      const result = await this.authService.register(validation.data);
      res.status(201).json(ResponseFormatter.success(result));
    } catch (err) {
      res.status(500).json(ResponseFormatter.error('Registration failed', 'AUTH_ERROR', err));
    }
  };

  public getStatus = (req: HttpRequest, res: HttpResponse): void => {
    res.status(200).json(
      ResponseFormatter.success({
        status: 'online',
        authenticated: !!req.user,
        user: req.user,
      })
    );
  };
}

