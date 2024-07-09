import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import config from '@app/config';

import { AppService } from './app.service';
import { AppController } from './app.controller';
import { TagModule } from './tag/tag.module';
import { UserModule } from './user/user.module';
import { ArticleModule } from './article/article.module';
import { AuthMiddleware } from './user/middlewares/auth.middleware';

@Module({
  imports: [
    TypeOrmModule.forRoot(config.database),
    TagModule,
    UserModule,
    ArticleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
