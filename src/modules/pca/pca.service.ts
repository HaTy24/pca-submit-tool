import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { catchError, firstValueFrom, of, tap } from 'rxjs';
import { ENV_KEY } from 'src/shared/constants';

interface Statistic {
  id: number;
  code: string;
  value: number;
}

interface DataStatistics {
  date: string; // Hoặc Date nếu muốn dùng đối tượng Date
  statistics: Statistic[];
}

@Injectable()
export class PcaService {
  private readonly logger = new Logger(this.constructor.name);
  private isRelogging = false;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private async send(options: AxiosRequestConfig, retryCount = 0) {
    const response: any = await firstValueFrom(
      this.httpService.request(options).pipe(
        tap((response) => {
          const { data, status } = response;
          this.logger.log(
            `Receive from PCA [${status}]: ${JSON.stringify(data)}`,
          );
        }),
        catchError(async (error: AxiosError) => {
          if (error.response) {
            const { status } = error.response;

            // Xử lý 401/404 và retry
            if ((status === 401 || status === 404) && retryCount < 3) {
              this.logger.warn(
                `Received ${status}, attempting re-login ${retryCount}...`,
              );

              // Tránh nhiều requests cùng trigger re-login
              if (!this.isRelogging) {
                this.isRelogging = true;
                try {
                  await this.login();
                } finally {
                  this.isRelogging = false;
                }
              } else {
                // Đợi re-login hoàn thành
                while (this.isRelogging) {
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                }
              }

              // Retry request sau khi login lại
              return firstValueFrom(
                of(await this.send(options, retryCount + 1)),
              );
            }

            this.logger.error(`Error from PCA [${status}]: ${error.message}`);
          } else {
            this.logger.error(`Error from PCA: ${error.message}`);
          }

          throw error;
        }),
      ),
    );
    const { data } = response;

    return data;
  }

  public async login() {
    const response = await this.send({
      method: 'POST',
      url: '/login',
      data: {
        username: this.configService.get(ENV_KEY.PCA_USERNAME),
        password: this.configService.get(ENV_KEY.PCA_PASSWORD),
      },
    });

    this.httpService.axiosRef.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${response.token}`;
      return config;
    });

    return response;
  }

  public async getProjects() {
    return this.send({
      method: 'GET',
      url: '/api/projects',
      params: {
        getAll: true,
      },
    });
  }

  public async submit(data: DataStatistics) {
    return this.send({
      method: 'POST',
      url: '/api/statistics/0',
      data,
    });
  }
}
