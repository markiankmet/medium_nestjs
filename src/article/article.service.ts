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
import { FollowEntity } from '../profile/follow.entity';
import { CreateArticleDto, UpdateArticleDto } from './dto';
import { ArticleResponseInterface, ArticlesResponseInterface } from './types';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,
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

    if (query.favorited) {
      const user = await this.userRepository.findOne({
        where: { username: query.favorited },
        relations: ['favorites'],
      });

      const ids = user.favorites.map((article) => article.id);
      if (ids.length) {
        queryBuilder.andWhere('articles.id IN (:...ids)', {
          ids: ids,
        });
      } else {
        queryBuilder.andWhere('1=0');
      }
    }

    if (query.tag) {
      queryBuilder.andWhere('articles.tagList LIKE :tag', {
        tag: `%${query.tag}%`,
      });
    }

    if (query.author) {
      const author = await this.userRepository.findOne({
        where: { username: query.author },
      });
      queryBuilder.andWhere('articles.authorId = :id', {
        id: author.id,
      });
    }

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    let favoritedIds: number[] = [];

    if (currentUserId) {
      const currentUser = await this.userRepository.findOne({
        where: { id: currentUserId },
        relations: ['favorites'],
      });
      favoritedIds = currentUser.favorites.map(
        (favoritedArticle) => favoritedArticle.id,
      );
    }

    const articles = await queryBuilder.getMany();
    const articlesWithFavorites = articles.map((article) => {
      const favorited = favoritedIds.includes(article.id);
      return { ...article, favorited };
    });

    return {
      articles: articlesWithFavorites,
      articlesCount,
    };
  }

  async feedArticles(
    currentUserId: number,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    const followedUsers = await this.followRepository.find({
      where: {
        followerId: currentUserId,
      },
    });

    if (!followedUsers.length) {
      return { articles: [], articlesCount: 0 };
    }

    const followedUsersIds = followedUsers.map(
      (followedUser) => followedUser.followingId,
    );

    const currentUser = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: ['favorites'],
    });

    const favoritedIds = currentUser.favorites.map(
      (favoriteArticle) => favoriteArticle.id,
    );

    const queryBuilder = this.dataSource
      .getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    queryBuilder.andWhere('articles.authorId IN (:...ids)', {
      ids: followedUsersIds,
    });
    const articlesCount = await queryBuilder.getCount();

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    const articlesByFollowedUsers = await queryBuilder.getMany();
    const articlesByFollowedUsersWithFavorites = articlesByFollowedUsers.map(
      (articleByFollowedUsers) => {
        const favorited = favoritedIds.includes(articleByFollowedUsers.id);
        return { ...articleByFollowedUsers, favorited };
      },
    );

    return { articles: articlesByFollowedUsersWithFavorites, articlesCount };
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

  async addArticleToFavorites(
    slug: string,
    currentUserId: number,
  ): Promise<ArticleEntity> {
    const article = await this.getArticleBySlug(slug);
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: ['favorites'],
    });

    const isNotFavorited =
      user.favorites.findIndex(
        (articleInFavorites) => articleInFavorites.id === article.id,
      ) === -1;

    if (isNotFavorited) {
      user.favorites.push(article);
      article.favoritedCount++;
      await this.articleRepository.save(article);
      await this.userRepository.save(user);
    }

    return article;
  }

  async removeArticleFromFavorites(
    slug: string,
    userId: number,
  ): Promise<ArticleEntity> {
    const article = await this.getArticleBySlug(slug);
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });

    const articleIndex = user.favorites.findIndex(
      (favoriteArticle) => favoriteArticle.id === article.id,
    );

    if (articleIndex >= 0) {
      user.favorites.splice(articleIndex, 1);
      article.favoritedCount--;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
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
