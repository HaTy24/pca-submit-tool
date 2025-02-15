import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { catchError, firstValueFrom, of, tap } from 'rxjs';

@Injectable()
export class AuthService {
  private logger = new Logger(this.constructor.name);
  constructor(private readonly httpService: HttpService) {}
  public async login() {
    const response = await firstValueFrom(
      this.httpService
        .request({
          method: 'POST',
          url: '/login',
          data: {
            password: '7grj09D7gMeg',
            username: 'thienty.ha@estuary.solutions',
          },
        })
        .pipe(
          tap((response) => {
            const { data, status } = response;
            this.logger.log(
              `Receive from PCA [${status}]: ${JSON.stringify(data)}`,
            );
          }),
          catchError((error) => {
            if (error.response) {
              const { data, status } = error.response;
              this.logger.error(
                `Error from PCA [${status}]: - ${error.message}: ${JSON.stringify(data)}`,
              );
            } else {
              this.logger.error(`Error from PCA - ${error.message}`);
            }

            return of(error.response);
          }),
        ),
    );
    const { data } = response;

    return data;
  }
}
