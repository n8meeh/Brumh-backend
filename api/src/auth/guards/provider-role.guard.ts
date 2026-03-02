import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Decorator para especificar qué roles de provider tienen acceso.
 * Uso: @ProviderRoles('provider', 'provider_admin')
 */
export const PROVIDER_ROLES_KEY = 'providerRoles';
export const ProviderRoles = (...roles: string[]) => SetMetadata(PROVIDER_ROLES_KEY, roles);

/**
 * ProviderRoleGuard: Verifica que el usuario tenga uno de los roles permitidos.
 * DEBE usarse DESPUÉS de un guard de autenticación (AuthGuard o PremiumStaffGuard).
 *
 * Uso: @UseGuards(PremiumStaffGuard, ProviderRoleGuard) + @ProviderRoles('provider', 'provider_admin')
 */
@Injectable()
export class ProviderRoleGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(PROVIDER_ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // Si no hay roles definidos, permitir acceso
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !requiredRoles.includes(user.role)) {
            throw new ForbiddenException('No tienes permisos suficientes para esta acción.');
        }

        return true;
    }
}
