import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { verify, JwtPayload } from 'jsonwebtoken';
import * as process from 'node:process';

import { ExpressRequestInterface } from '@app/types/expressRequest.interface';
import { UserService } from '@app/user/user.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: ExpressRequestInterface, res: Response, next: NextFunction) {
    const { authorization } = req.headers;

    if (!authorization) {
      req.user = null;
      next();
      return;
    }

    const token = authorization.split(' ')[1];
    try {
      const decode = verify(token, process.env.JWT_SECRET) as JwtPayload;
      req.user = await this.userService.findById(decode.id);
    } catch {
      req.user = null;
    }
    next();
  }
}
