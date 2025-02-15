import { Test, TestingModule } from '@nestjs/testing';
import { PcaController } from './pca.controller';
import { PcaService } from './pca.service';

describe('PcaController', () => {
  let controller: PcaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PcaController],
      providers: [PcaService],
    }).compile();

    controller = module.get<PcaController>(PcaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
