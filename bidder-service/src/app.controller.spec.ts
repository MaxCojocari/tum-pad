import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('AppController', () => {
  let appController: AppController;
  let configService: ConfigService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              database: {
                host: 'localhost',
                port: 5432,
                user: 'testuser',
                password: 'testpass',
                db: 'testdb',
              },
              serviceRegistryGrpc: {
                url: 'localhost:50051',
              },
            }),
          ],
        }),
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    configService = app.get<ConfigService>(ConfigService);
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('configuration', () => {
    it('should retrieve correct configuration values', () => {
      expect(configService.get('database.host')).toBe('localhost');
      expect(configService.get('database.port')).toBe(5432);
      expect(configService.get('database.user')).toBe('testuser');
      expect(configService.get('database.password')).toBe('testpass');
      expect(configService.get('database.db')).toBe('testdb');
      expect(configService.get('serviceRegistryGrpc.url')).toBe(
        'localhost:50051',
      );
    });
  });
});
