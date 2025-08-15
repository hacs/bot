// author.id: reason
const blockedAuthors: Record<number, string> = {}

// repository.id: reason
const blockedRepositories: Record<number, string> = {
  149443194:
    'The repository was removed because it was causing issues with HACS and conflicting with other repositories.',
}

export function isBlockedAuthor(authorId: number): boolean {
  return !!blockedAuthors[authorId]
}

export function isBlockedRepository(repoId: number): boolean {
  return !!blockedRepositories[repoId]
}
