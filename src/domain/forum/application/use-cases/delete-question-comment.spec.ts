import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { makeQuestionComment } from 'tests/factories/make-question-comment'
import { InMemoryQuestionCommentsRepository } from 'tests/repositories/in-memory-question-comments-repository'
import { DeleteQuestionCommentUseCase } from './delete-question-comment'
import { PermissionDeniedError } from './errors/permission-denied-error'

let inMemoryQuestionCommentsRepository: InMemoryQuestionCommentsRepository
let sut: DeleteQuestionCommentUseCase

describe('Delete Comment on a Question', () => {
  beforeEach(() => {
    inMemoryQuestionCommentsRepository =
      new InMemoryQuestionCommentsRepository()
    sut = new DeleteQuestionCommentUseCase(inMemoryQuestionCommentsRepository)
  })

  it('should be able to delete a comment on a question', async () => {
    const questionComment = makeQuestionComment()

    await inMemoryQuestionCommentsRepository.create(questionComment)

    await sut.execute({
      questionCommentId: questionComment.id.toString(),
      authorId: questionComment.authorId.toString(),
    })

    expect(inMemoryQuestionCommentsRepository.items).toHaveLength(0)
  })

  it('should not be able to delete another user comment', async () => {
    const questionComment = makeQuestionComment({
      authorId: new UniqueEntityID('author-1'),
    })

    await inMemoryQuestionCommentsRepository.create(questionComment)

    const result = await sut.execute({
      questionCommentId: questionComment.id.toString(),
      authorId: 'author-2',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(PermissionDeniedError)
  })
})
