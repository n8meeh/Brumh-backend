import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * AdminGuard: verifica JWT válido Y que el usuario tenga rol 'admin'.
 * Uso: @UseGuards(AdminGuard)
 */
@Injectable()
export class AdminGuard extends AuthGuard('jwt') implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        // 1. Validar JWT (lanza UnauthorizedException si el token es inválido)
        await super.canActivate(context);

        // 2. Verificar rol admin
        const request = context.switchToHttp().getRequest();
        if (request.user?.role !== 'admin') {
            throw new ForbiddenException('Acceso restringido a administradores');
        }

        return true;
    }
}
