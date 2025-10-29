import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from '@task-flow/shared';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';

@Controller('tasks/:taskId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Param('taskId') taskId: string,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commentsService.create(createCommentDto, +taskId, user.sub);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findByTask(@Param('taskId') taskId: string) {
    return this.commentsService.findByTask(+taskId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(+id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.commentsService.remove(+id, user.sub);
  }

  // Microservice message patterns
  @MessagePattern('get_task_comments')
  async getTaskComments(@Payload() data: { taskId: number }) {
    return this.commentsService.findByTask(data.taskId);
  }

  @MessagePattern('create_comment')
  async createComment(
    @Payload() data: { taskId: number; content: string; userId: string },
  ) {
    return this.commentsService.create(
      { content: data.content },
      data.taskId,
      data.userId,
    );
  }
}