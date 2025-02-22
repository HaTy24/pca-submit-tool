import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { Ctx, Hears, Start, Update } from 'nestjs-telegraf';
import { tap, catchError, firstValueFrom } from 'rxjs';
import { ENV_KEY } from 'src/shared/constants';
import { Context } from 'telegraf';
import { PcaService } from '../pca/pca.service';

@Update()
@Injectable()
export class TelegramService {
  private readonly logger = new Logger(this.constructor.name);
  private projects: any[] = [
    { id: 158, code: 'FICO-CD-23' },
    { id: 197, code: 'VMD-IWS-OP-24' },
    { id: 254, code: 'DEHEUS-INCENTIVEMANAGEMENT-OTHER-CD-24' },
  ];
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly pcaService: PcaService,
  ) {}

  @Start()
  async start(@Ctx() ctx: Context) {
    await ctx.reply('Welcome');
  }

  @Hears('/projects')
  async getProjects(@Ctx() ctx: Context) {
    try {
      const message = this.projects
        .map((project) => `➤ ${project.id} - ${project.code}`)
        .join('\n');
      await ctx.reply(`📌 Projects:\n\n${message}`);
    } catch (error) {
      this.logger.error(error);
      ctx.reply(`❌ Error occurred!\nError: ${error.message || error}`);
    }
  }

  @Hears(/^(\/add) (.+)/)
  async addId(@Ctx() ctx: Context) {
    if (!('text' in ctx.message)) {
      await ctx.reply('Invalid message type');
      return;
    }
    const [, data] = ctx.message.text.split(' ~ ');
    try {
      const [id, code] = data.split(',');
      this.projects.push({
        id: parseInt(id.trim().split(':')[1].trim()),
        code: code.trim().split(':')[1].trim(),
      });
      await ctx.reply(
        'Successfully added!\n\n' +
          `📌 Projects:\n\n${this.projects
            .map((project) => `➤ ${project.id} - ${project.code}`)
            .join('\n')}`,
      );
    } catch (error) {
      this.logger.error(error);
      ctx.reply(`❌ Error occurred!\nError: ${error.message || error}`);
    }
  }

  @Hears(/^(\/submit) (.+)/)
  async submit(@Ctx() ctx: Context) {
    if (!('text' in ctx.message)) {
      await ctx.reply('Invalid message type');
      return;
    }
    const [, data] = ctx.message.text.split(' ~ ');
    try {
      const projectIds = data.split(',').map((id) => parseInt(id.trim()));
      const projects = this.projects.filter((project) =>
        projectIds.includes(project.id),
      );

      let value = [];
      if (projects.length === 3) {
        value = [35, 35, 30];
      } else {
        value = Array(projects.length).fill(100 / projects.length);
      }

      const statistics = [];
      for (let i = 0; i < value.length; i++) {
        statistics.push({
          id: projects[i].id,
          code: projects[i].code,
          value: value[i],
        });
      }

      await this.pcaService.submit({
        date: new Date().toISOString().split('T')[0],
        statistics,
      });

      await ctx.reply(
        '✅ Submission successful!\n\n' +
          `Your submitted: \n\n${projects
            .map((project) => `➤ ${project.id} - ${project.code}`)
            .join('\n')}\n\n` +
          'Thanks for updating your progress! 🚀',
      );
    } catch (error) {
      this.logger.error(error);
      ctx.reply(`❌ Error occurred!\nError: ${error.message || error}`);
    }
  }

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
