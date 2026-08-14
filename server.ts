import 'dotenv/config';
import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './src/backend/nestjs/app.module';
import { ResponseInterceptor } from './src/backend/nestjs/common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './src/backend/nestjs/common/filters/http-exception.filter';

import { runDatabaseMigrationsAndSeed } from './src/backend/database/runMigrations';

import helmet from 'helmet';

async function startServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 7869;
  const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;

  // Run database schema migrations & seeds asynchronously on boot
  try {
    await runDatabaseMigrationsAndSeed();
  } catch (err) {
    console.error('Migration boot warning:', err);
  }

  // 1. Create NestJS App
  const nestApp = await NestFactory.create(AppModule);

  // Security Headers & CORS
  nestApp.use(helmet({ contentSecurityPolicy: false }));
  nestApp.enableCors({
    origin: [appUrl, 'http://localhost:5173', `http://localhost:${PORT}`],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  nestApp.setGlobalPrefix('api');
  nestApp.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  nestApp.useGlobalInterceptors(new ResponseInterceptor());
  nestApp.useGlobalFilters(new AllExceptionsFilter());

  // 2. Register Vite middleware on NestJS for SPA non-API routes
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    nestApp.use((req: Request, res: Response, next: NextFunction) => {
      const isApi = (req.path && req.path.startsWith('/api')) ||
                    (req.url && req.url.startsWith('/api')) ||
                    (req.originalUrl && req.originalUrl.startsWith('/api'));
      if (isApi) {
        return next();
      }
      vite.middlewares(req, res, next);
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    nestApp.use(express.static(distPath));
    nestApp.use((req: Request, res: Response, next: NextFunction) => {
      const isApi = (req.path && req.path.startsWith('/api')) ||
                    (req.url && req.url.startsWith('/api')) ||
                    (req.originalUrl && req.originalUrl.startsWith('/api'));
      if (isApi) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 3. Start NestJS server
  await nestApp.listen(PORT, '0.0.0.0');
  console.log(`🚀 ReviewScore AI NestJS Platform Server running on http://0.0.0.0:${PORT}`);
}

startServer();
