import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
    private storage: admin.storage.Storage;
    private readonly logger = new Logger(FirebaseService.name);

    // 🔴 PON AQUÍ EL NOMBRE EXACTO QUE COPIASTE DE LA CONSOLA
    // ¡SIN EL 'gs://' AL PRINCIPIO!
    private readonly bucketName = 'vrum-app-4f563.firebasestorage.app';

    onModuleInit() {
        const jsonPath = path.resolve('firebase-adminsdk.json');

        if (!admin.apps.length) {
            const serviceAccount = require(jsonPath);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: this.bucketName // Lo inyectamos aquí
            });
        }
        this.storage = admin.storage();
    }

    async uploadFile(file: Express.Multer.File, folder: string = 'uploads'): Promise<string> {
        // Forzamos el uso del bucket específico
        const bucket = this.storage.bucket(this.bucketName);

        const filename = `${folder}/${Date.now()}_${file.originalname}`;
        const fileRef = bucket.file(filename);

        this.logger.log(`Intentando subir a bucket: ${this.bucketName}`);

        try {
            await fileRef.save(file.buffer, {
                contentType: file.mimetype,
                public: true,
            });

            return `https://storage.googleapis.com/${this.bucketName}/${filename}`;

        } catch (error) {
            this.logger.error(`❌ ERROR GRAVE: No se encuentra el bucket ${this.bucketName}. Verifica la consola de Firebase.`);
            throw error;
        }
    }
}