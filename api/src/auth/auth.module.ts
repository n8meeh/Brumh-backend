import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy'; // <--- Importar
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: 'CLAVE_SECRETA_SUPER_SEGURA', // En producción esto va en variables de entorno (.env)
      signOptions: { expiresIn: '365d' }, // El token dura 1 año (Persistencia tipo Instagram)
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // <--- Agregar JwtStrategy
  exports: [AuthService, JwtStrategy],   // <--- Agregar aquí
})
export class AuthModule { }