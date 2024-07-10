import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import slugify from 'slugify';

import { UserEntity } from '../user/user.entity';
import { ArticleEntity } from './article.entity';
import { CreateArticleDto, UpdateArticleDto } from './dto';
import { ArticleResponseInterface, ArticlesResponseInterface } from './types';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    private dataSource: DataSource,
  ) {}

  async findAll(
    currentUserId: number,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    const queryBuilder = this.dataSource
      .getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    const articles = await queryBuilder.getMany();

    return {
      articles,
      articlesCount,
    };
  }

  async create(
    currentUser: UserEntity,
    createArticleDto: CreateArticleDto,
  ): Promise<ArticleEntity> {
    const article = new ArticleEntity();

    Object.assign(article, createArticleDto);
    if (!article.tagList) {
      article.tagList = [];
    }
    article.slug = this.getSlug(createArticleDto.title);
    article.author = currentUser;
    return await this.articleRepository.save(article);
  }

  async findBySlug(slug: string): Promise<ArticleEntity> {
    const article = await this.getArticleBySlug(slug);

    if (!article) {
      throw new NotFoundException(`Article with slug - ${article} not found`);
    }

    return article;
  }

  async updateBySlug(
    currentUserId: number,
    slug: string,
    updateArticleDto: UpdateArticleDto,
  ): Promise<ArticleEntity> {
    const article = await this.getArticleBySlug(slug);

    if (article.author.id !== currentUserId) {
      throw new ForbiddenException('Not allowed!');
    }

    if (!article) {
      throw new NotFoundException(`Article with slug: ${slug} not found!`);
    }

    if (updateArticleDto.title && updateArticleDto.title !== article.title) {
      article.slug = this.getSlug(updateArticleDto.title);
    }

    Object.assign(article, updateArticleDto);

    return await this.articleRepository.save(article);
  }

  async deleteBySlug(currentUserId: number, slug: string): Promise<void> {
    const article = await this.getArticleBySlug(slug);

    if (article.author.id !== currentUserId) {
      throw new ForbiddenException('Forbidden');
    }

    if (!article) {
      throw new NotFoundException(`Article with slug: ${slug} not found`);
    }

    await this.articleRepository.remove(article);
  }

  async getArticleBySlug(slug: string): Promise<ArticleEntity> {
    return await this.articleRepository.findOne({ where: { slug } });
  }

  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return {
      article: {
        ...article,
      },
    };
  }

  private getSlug(title: string): string {
    return (
      slugify(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
}
