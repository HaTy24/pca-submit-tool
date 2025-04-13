import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { catchError, firstValueFrom, tap } from 'rxjs';
import { ENV_KEY } from '../../shared/constants';

type StatisticPayload = {
  id?: number;
  code?: string;
  value?: number;
};

type DataStatisticsPayload = {
  date?: string;
  statistics?: StatisticPayload[];
};

type GetProjectsPayload = {
  getAll?: boolean;
  code?: string;
};

type GetSubmittedStatisticsPayload = {
  date_current?: string;
  limit?: number;
};

@Injectable()
export class PcaService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.login();
  }

  private async send(options: AxiosRequestConfig) {
    try {
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
    } catch (error) {
      this.logger.error('Error in HTTP request:', error);
      throw new Error('Failed to send HTTP request');
    }
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

  public async getProjects(params?: GetProjectsPayload) {
    return this.send({
      method: 'GET',
      url: '/api/projects',
      params,
    });
  }

  public async getSubmittedStatistics(params?: GetSubmittedStatisticsPayload) {
    return this.send({
      method: 'GET',
      url: '/api/statistics/0',
      params,
    });
  }

  public async submit(data: DataStatisticsPayload) {
    return this.send({
      method: 'POST',
      url: '/api/statistics/0',
      data,
    });
  }
}
