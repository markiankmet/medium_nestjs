import { Injectable } from '@nestjs/common';

@Injectable()
export class ArticleService {
  async create(): Promise<any> {
    return new Promise((resolve) => resolve(true));
  }
}
