import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProvidersModule } from './providers/providers.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { OrdersModule } from './orders/orders.module';
import { NegotiationsModule } from './negotiations/negotiations.module';
import { FilesModule } from './files/files.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { ReviewsModule } from './reviews/reviews.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { CategoriesModule } from './categories/categories.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'vrum_db',

      // CAMBIO AQUÍ: Esto carga tus entidades automáticamente sin escribirlas una por una
      autoLoadEntities: true,

      synchronize: false,
    }),
    UsersModule,
    AuthModule,
    ProvidersModule,
    VehiclesModule,
    OrdersModule,
    NegotiationsModule, // Asegúrate de que este módulo esté importado aquí también (Nest lo hace solo al crear el recurso)
    FilesModule, PostsModule, CommentsModule, ReviewsModule, NotificationsModule, ReportsModule,
    CategoriesModule, // 🆕 Módulo de catálogo de especialidades
    ChatModule, // 💬 Módulo de chat en tiempo real
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
