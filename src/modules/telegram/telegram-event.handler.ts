import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { Ctx, Hears, Start, Update } from 'nestjs-telegraf';
import { tap, catchError, firstValueFrom } from 'rxjs';
import { ENV_KEY } from 'src/shared/constants';
import { Context } from 'telegraf';
import { PcaService } from '../pca/pca.service';
import { ProjectService } from '../project/project.service';
import { format, startOfYear } from 'date-fns';
import { getDatesOfMonth } from 'src/shared/utils/date.util';

@Update()
@Injectable()
export class TelegramEventHandler {
  private readonly logger = new Logger(this.constructor.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly pcaService: PcaService,
    private readonly projectService: ProjectService,
  ) {}

  @Start()
  async start(@Ctx() ctx: Context) {
    await ctx.reply('Welcome');
  }

  @Hears('/help')
  async help(@Ctx() ctx: Context) {
    try {
      await ctx.reply(
        '👉 Submit: `/submit ~ task_id1, task_id2`\n' +
          '📌 Get project list: `/projects`\n' +
          '➕ Add new project: `/add ~ id: project_id, code: project_code`\n' +
          '🔍 Search project by code: `/search ~ project_code`\n' +
          '📌 Get missing dates: `/missing`\n',
      );
    } catch (error) {
      this.logger.error(error);
      ctx.reply(`❌ Error occurred!\nError: ${error.message ?? error}`);
    }
  }

  @Hears('/projects')
  async getProjects(@Ctx() ctx: Context) {
    try {
      const projects = await this.projectService.getAll();
      if (!projects.length) {
        await ctx.reply(
          '⚠️ No projects found. Please add a new project using:\n\n➕ `/add ~ id: project_id, code: project_code`',
        );
        return;
      }

      const message = projects
        .map((project) => `➤ ${project.id} - ${project.code}`)
        .join('\n');
      await ctx.reply(`📌 Projects:\n\n${message}`);
    } catch (error) {
      this.logger.error(error);
      ctx.reply(`❌ Error occurred!\nError: ${error.message ?? error}`);
    }
  }

  @Hears(/^(\/search) (.+)/)
  async searchProject(@Ctx() ctx: Context) {
    if (!('text' in ctx.message)) {
      await ctx.reply('Invalid message type');
      return;
    }
    const [, data] = ctx.message.text.split(' ~ ');
    try {
      const projects = await this.pcaService.getProjects({ code: data });
      if (!projects.data.length) {
        await ctx.reply('⚠️ No projects found in PCA system.');
        return;
      }
      await ctx.reply(
        `📌 Projects:\n\n${projects.data
          .map((project) => `➤ ${project.id} - ${project.code}`)
          .join('\n')}`,
      );
    } catch (error) {
      this.logger.error(error);
      ctx.reply(`❌ Error occurred!\nError: ${error.message ?? error}`);
    }
  }

  @Hears(/^(\/add) (.+)/)
  async addProject(@Ctx() ctx: Context) {
    if (!('text' in ctx.message)) {
      await ctx.reply('Invalid message type');

      return;
    }
    const [, data] = ctx.message.text.split(' ~ ');
    try {
      const [id, code] = data.split(',');
      const existingProject = await this.projectService.getOne({
        id: parseInt(id.trim().split(':')[1].trim()),
      });
      if (existingProject) {
        await ctx.reply(
          '⚠️ Project already exists!\n\n' +
            `📌 Project:\n\n➤ ${existingProject.id} - ${existingProject.code}`,
        );

        return;
      }
      await this.projectService.create({
        id: parseInt(id.trim().split(':')[1].trim()),
        code: code.trim().split(':')[1].trim(),
        name: code.trim().split(':')[1].trim(),
      });
      await ctx.reply(
        'Successfully added!\n\n' + `📌 Project:\n\n➤ ${id} - ${code}`,
      );
    } catch (error) {
      this.logger.error(error);
      ctx.reply(`❌ Error occurred!\nError: ${error.message ?? error}`);
    }
  }

  @Hears('/missing')
  async getMissingDates(@Ctx() ctx: Context) {
    try {
      const currentDate = format(new Date(), 'yyyy-MM-dd');
      const submittedData = await this.pcaService.getSubmittedStatistics({
        date_current: currentDate,
        limit: 30,
      });

      const submittedDates = submittedData.data.map((item) => {
        return format(new Date(item.date), 'yyyy-MM-dd');
      });
      const datesOfMonth = getDatesOfMonth({
        date: submittedData.data.length
          ? new Date(submittedData.data[0].date)
          : startOfYear(new Date()),
        endDate: new Date(),
        isSkipWeekend: true,
      });

      const missingDates = datesOfMonth.filter(
        (date) => !submittedDates.includes(date),
      );
      const message = missingDates.map((date) => `➤ ${date}`).join('\n');
      if (!message) {
        await ctx.reply('✅ No missing dates!');

        return;
      }

      ctx.reply(
        `📌 Missing dates:\n\n${message}\n\n` +
          'Please submit your progress for these dates.\n' +
          '👉 Submit: `/additional ~ date:date, id: task_id1, task_id2`\n',
      );
    } catch (error) {
      this.logger.error(error);
      ctx.reply(`❌ Error occurred!\nError: ${error.message ?? error}`);
    }
  }

  @Hears(/^(\/additional) (.+)/)
  async additionalMissingDate(@Ctx() ctx: Context) {
    if (!('text' in ctx.message)) {
      await ctx.reply('Invalid message type');

      return;
    }
    const [, data] = ctx.message.text.split(' ~ ');
    try {
      const indexOfFirstComma = data.indexOf(',');
      const date = data.substring(0, indexOfFirstComma);
      const ids = data.substring(indexOfFirstComma + 1);
      const projectIds = ids
        .split(':')[1]
        .split(',')
        .map((id) => parseInt(id.trim()));
      const projects = await this.projectService.getAll({
        id: { $in: projectIds },
      });

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
        date: date.split(':')[1].trim(),
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
      ctx.reply(`❌ Error occurred!\nError: ${error.message ?? error}`);
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
      const projects = await this.projectService.getAll({
        id: { $in: projectIds },
      });

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
        date: format(new Date(), 'yyyy-MM-dd'),
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
      ctx.reply(`❌ Error occurred!\nError: ${error.message ?? error}`);
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
