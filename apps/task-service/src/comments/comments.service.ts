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
    userId: string,
  ): Promise<Comment> {
    const comment = this.commentRepository.create({
      ...createCommentDto,
      taskId,
      createdBy: userId,
    });

    const savedComment = await this.commentRepository.save(comment);

    // Emit event for comment creation
    this.rabbitClient.emit('notification.comment.created', {
      id: savedComment.id.toString(),
      taskId: savedComment.taskId.toString(),
      content: savedComment.content,
      createdBy: savedComment.createdBy,
      createdAt: savedComment.createdAt,
      taskOwnerId: savedComment.createdBy, // Assuming the comment creator should be notified
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

  async remove(id: number, userId: string): Promise<void> {
    const comment = await this.findOne(id);

    // Check if user is the owner of the comment
    if (comment.createdBy !== userId) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    await this.commentRepository.remove(comment);

    // Emit event for comment deletion
    this.rabbitClient.emit('notification.comment.deleted', {
      commentId: id.toString(),
      taskId: comment.taskId.toString(),
      deletedBy: userId,
      deletedAt: new Date(),
    });
  }
}