import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'CLAVE_SECRETA_SUPER_SEGURA',
        });
    }

    async validate(payload: any) {
        // Verificar que el sessionToken del JWT coincida con el almacenado en BD.
        // Esto invalida automáticamente cualquier sesión anterior al hacer login nuevo.
        const user = await this.usersService.findByIdForSession(Number(payload.sub));

        if (!user) {
            throw new UnauthorizedException('Usuario no encontrado');
        }

        if (user.currentSessionToken !== payload.sessionToken) {
            throw new UnauthorizedException(
                'Sesión inválida o expirada. Por favor inicia sesión de nuevo.',
            );
        }

        return {
            userId: Number(payload.sub),
            id: Number(payload.sub), // Alias para compatibilidad
            email: payload.email,
            role: user.role, // Siempre desde BD para reflejar cambios en tiempo real
            providerId: user.providerId || null, // Siempre desde BD
        };
    }
}
