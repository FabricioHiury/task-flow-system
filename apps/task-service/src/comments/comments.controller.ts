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
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(
    @Param('taskId') taskId: string,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commentsService.create(createCommentDto, +taskId, user.sub);
  }

  @Get()
  findByTask(@Param('taskId') taskId: string) {
    return this.commentsService.findByTask(+taskId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(+id);
  }

  @Delete(':id')
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
    @Payload() data: { taskId: number; content: string; userId: number },
  ) {
    return this.commentsService.create(
      { content: data.content },
      data.taskId,
      data.userId,
    );
  }
}