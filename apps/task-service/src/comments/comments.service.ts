import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Comment } from './comment.entity';
import { CreateCommentDto } from '@task-flow/shared';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @Inject('RABBITMQ_SERVICE')
    private rabbitClient: ClientProxy,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
    taskId: number,
    userId: number,
  ): Promise<Comment> {
    const comment = this.commentRepository.create({
      ...createCommentDto,
      taskId,
      createdBy: userId,
    });

    const savedComment = await this.commentRepository.save(comment);

    // Emit event for comment creation
    this.rabbitClient.emit('comment.created', {
      commentId: savedComment.id,
      taskId: savedComment.taskId,
      content: savedComment.content,
      createdBy: savedComment.createdBy,
      createdAt: savedComment.createdAt,
    });

    return savedComment;
  }

  async findByTask(taskId: number): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { taskId },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['task'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  async remove(id: number, userId: number): Promise<void> {
    const comment = await this.findOne(id);

    // Check if user is the owner of the comment
    if (comment.createdBy !== userId) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    await this.commentRepository.remove(comment);

    // Emit event for comment deletion
    this.rabbitClient.emit('comment.deleted', {
      commentId: id,
      taskId: comment.taskId,
      deletedBy: userId,
      deletedAt: new Date(),
    });
  }
}