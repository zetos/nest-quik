import { AuthGuard } from '@nestjs/passport';

export class RTokenGuard extends AuthGuard('jwt-refresh') {
  constructor() {
    super();
  }
}
