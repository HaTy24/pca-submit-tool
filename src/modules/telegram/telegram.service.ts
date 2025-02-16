import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { tap, catchError, firstValueFrom } from 'rxjs';
import { ENV_KEY } from 'src/shared/constants';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(this.constructor.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async sendMessage(message: string): Promise<void> {
    const url = `bot${this.configService.get(ENV_KEY.TELEGRAM_BOT_TOKEN)}/sendMessage`;
    await firstValueFrom(
      this.httpService
        .post(url, {
          chat_id: this.configService.get(ENV_KEY.TELEGRAM_CHAT_ID),
          text: message,
        })
        .pipe(
          tap((response) => {
            const { data, status } = response;
            this.logger.log(
              `Receive from Telegram [${status}]: ${JSON.stringify(data)}`,
            );
          }),
          catchError(async (error: AxiosError) => {
            this.logger.error(`Error from Telegram: ${error.message}`);

            throw error;
          }),
        ),
    );
  }
}
