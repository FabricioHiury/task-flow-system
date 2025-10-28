import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TokenInvalidationService } from '../../auth/token-invalidation.service';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [JwtAuthGuard, TokenInvalidationService],
  exports: [JwtAuthGuard, TokenInvalidationService],
})
export class GuardsModule {}