import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  /**
   * Registrar un nuevo usuario
   */
  async register(registerDto: RegisterDto) {

    // 1. Verificar si el usuario ya existe
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // 2. Crear el usuario (UsersService ya hashea la contraseña)
    // TypeORM mapea automáticamente fullName → full_name en BD
    const createUserDto = {
      email: registerDto.email,
      password: registerDto.password,
      fullName: registerDto.fullName, // ✅ Usamos camelCase (propiedad de la entidad)
      role: registerDto.role || 'user',
    };

    const newUser = await this.usersService.create(createUserDto);


    // 3. Generar token y hacer login automático
    return this.login(newUser);
  }

  // 1. Validar que el usuario existe y la contraseña coincide
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    // Si el usuario existe y la contraseña encriptada coincide...
    if (user && await bcrypt.compare(pass, user.password)) {
      // Verificar si el usuario está baneado
      if (user.bannedUntil && new Date() < new Date(user.bannedUntil)) {
        const bannedUntilDate = new Date(user.bannedUntil).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });
        throw new ForbiddenException(`Tu cuenta está suspendida hasta el ${bannedUntilDate}`);
      }

      const { password, ...result } = user; // Quitamos la password del resultado
      return result;
    }
    return null;
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // Por seguridad, no decimos si el email existe o no, pero retornamos éxito falso
      return { message: 'Si el correo existe, se ha enviado un código.' };
    }

    // Generamos un token aleatorio simple
    const token = randomBytes(32).toString('hex');

    // Establecemos expiración (1 hora desde ahora)
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    // Guardamos en BD usando un método que crearemos en UsersService, 
    // OJO: Si tienes acceso al repo aquí, úsalo directo. Asumiré que usas UsersService.
    await this.usersService.saveResetToken(user.id, token, expires);

    // 📧 AQUÍ ENVIARÍAS EL EMAIL REAL
    // Por ahora, simulamos:
    console.log(`=========================================`);
    console.log(`🔑 TOKEN DE RECUPERACIÓN PARA ${email}:`);
    console.log(token);
    console.log(`=========================================`);

    return { message: 'Revisa tu correo (o la consola del servidor) para obtener el código.' };
  }

  // 2. Establecer nueva contraseña
  async resetPassword(token: string, newPassword: string) {
    // Buscamos usuario por token y verificamos fecha
    const user = await this.usersService.findByResetToken(token);

    if (!user) throw new BadRequestException('Token inválido o expirado');

    // Encriptamos la nueva clave
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Actualizamos usuario y limpiamos el token
    await this.usersService.updatePasswordAndClearToken(user.id, hashedPassword);

    return { message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' };
  }

  // 2. Generar el Token (Login)
  async login(user: any) {
    // Generamos un ID de sesión único para la estrategia de "Sesión Única"
    const sessionToken = uuidv4();

    // Guardamos ese ID en la base de datos (invalidando sesiones anteriores)
    await this.usersService.updateSessionToken(user.id, sessionToken);

    // Creamos el Payload (lo que va dentro del JWT)
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionToken: sessionToken // Metemos el ID en el token
    };

    return {
      access_token: this.jwtService.sign(payload), // Generamos el JWT firmado
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    };
  }
}