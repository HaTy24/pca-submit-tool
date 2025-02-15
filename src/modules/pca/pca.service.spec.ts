import { Test, TestingModule } from '@nestjs/testing';
import { PcaService } from './pca.service';

describe('PcaService', () => {
  let service: PcaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PcaService],
    }).compile();

    service = module.get<PcaService>(PcaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
