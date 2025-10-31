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
    this.rabbitClient.emit('task_comment_created', {
      id: savedComment.id.toString(),
      taskId: savedComment.taskId.toString(),
      content: savedComment.content,
      createdBy: savedComment.createdBy,
      createdAt: savedComment.createdAt,
      taskOwnerId: savedComment.createdBy, 
    });

    return savedComment;
  }

  async findByTask(taskId: number, paginationDto?: { page: number; size: number }): Promise<{ comments: Comment[]; total: number }> {
    const { page = 1, size = 10 } = paginationDto || {};
    const skip = (page - 1) * size;

    const [comments, total] = await this.commentRepository.findAndCount({
      where: { taskId },
      order: { createdAt: 'ASC' },
      relations: ['user'],
      skip,
      take: size,
    });
    
    const mappedComments = comments.map(comment => ({
      ...comment,
      createdBy: comment.createdBy, // Manter o ID original
      username: comment.user?.username || comment.createdBy, // Adicionar username separado
    }));

    return { comments: mappedComments, total };
  }

  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['task', 'user'],
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