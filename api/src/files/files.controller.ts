import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FirebaseService } from './firebase.service';
import { memoryStorage } from 'multer'; // <--- CAMBIO IMPORTANTE

@Controller('files')
export class FilesController {
    constructor(private readonly firebaseService: FirebaseService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: memoryStorage(), // <--- Guardamos en RAM temporalmente
        limits: { fileSize: 5 * 1024 * 1024 }, // Límite de 5MB por seguridad
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(new BadRequestException('Solo imágenes permitidas'), false);
            }
            cb(null, true);
        },
    }))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('Falta el archivo');

        // Subimos a Firebase a la carpeta 'general'
        const url = await this.firebaseService.uploadFile(file, 'general');

        return {
            message: 'Imagen subida a Firebase con éxito',
            url: url // <--- Esta es la URL que guardarás en tu base de datos MySQL
        };
    }
}