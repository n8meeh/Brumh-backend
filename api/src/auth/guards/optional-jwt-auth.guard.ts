import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * OptionalJwtAuthGuard
 * 
 * Guardia que extrae el usuario del JWT si está presente, 
 * pero permite el acceso incluso si no hay token.
 * 
 * Útil para endpoints públicos que necesitan comportamiento 
 * personalizado basado en si el usuario está autenticado o no.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Sobreescribe handleRequest para no lanzar excepciones
   * @param err Error de autenticación (si existe)
   * @param user Usuario extraído del token (si existe)
   * @param info Información adicional
   * @param context Contexto de ejecución
   * @returns Usuario si existe, undefined en caso contrario
   */
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // Si hay un error o no hay usuario, simplemente devolvemos undefined
    // En lugar de lanzar una excepción (comportamiento por defecto)
    if (err || !user) {
      return undefined;
    }
    
    // Si hay usuario, lo devolvemos para que esté disponible en req.user
    return user;
  }

  /**
   * Sobreescribe canActivate para siempre permitir el acceso
   * pero intentando extraer el usuario si el token está presente
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      // Intenta validar el token usando la estrategia JWT
      await super.canActivate(context);
    } catch (err) {
      // Si falla la validación, no pasa nada, permitimos el acceso de todas formas
      // El usuario simplemente será undefined en req.user
    }
    
    // Siempre permitimos el acceso
    return true;
  }
}
