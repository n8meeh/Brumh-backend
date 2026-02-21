import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FirebaseService } from './firebase.service'; // <--- Importar

@Module({
    controllers: [FilesController],
    providers: [FirebaseService], // <--- Registrar
    exports: [FirebaseService]    // <--- Exportar por si UsersModule lo necesita
})
export class FilesModule { }