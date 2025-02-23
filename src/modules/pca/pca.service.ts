import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { catchError, firstValueFrom, tap } from 'rxjs';
import { ENV_KEY } from 'src/shared/constants';

interface Statistic {
  id: number;
  code: string;
  value: number;
}

interface DataStatistics {
  date: string;
  statistics: Statistic[];
}

@Injectable()
export class PcaService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private async send(options: AxiosRequestConfig) {
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
            console.log(error.response);

            const { status } = error.response;

            if (status === 401 || status === 404) {
              this.logger.warn(`Received ${status}`);

              await this.login();

              return firstValueFrom(
                this.httpService.request(options).pipe(
                  tap((response) => {
                    const { data, status } = response;
                    this.logger.log(
                      `Receive from PCA [${status}]: ${JSON.stringify(data)}`,
                    );
                  }),
                ),
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

  public async getProjects(params?: { getAll?: boolean; code?: string }) {
    return this.send({
      method: 'GET',
      url: '/api/projects',
      params,
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
