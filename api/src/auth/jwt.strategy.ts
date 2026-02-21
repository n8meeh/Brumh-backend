import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'CLAVE_SECRETA_SUPER_SEGURA', // Debe ser la misma que pusiste en auth.module.ts
        });
    }

    async validate(payload: any) {
        // Esto inyecta el usuario en "request.user" en todos los endpoints protegidos
        // ✅ Convertimos explícitamente sub a number para evitar problemas de tipos
        return { 
            userId: Number(payload.sub),  // Aseguramos que sea número
            email: payload.email, 
            role: payload.role 
        };
    }
}