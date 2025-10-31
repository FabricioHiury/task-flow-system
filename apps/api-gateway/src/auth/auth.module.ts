import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { TokenInvalidationService } from './token-invalidation.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    UsersModule,
  ],
  providers: [AuthService, JwtStrategy, LocalStrategy, TokenInvalidationService],
  controllers: [AuthController],
  exports: [AuthService, TokenInvalidationService],
})
export class AuthModule {}
