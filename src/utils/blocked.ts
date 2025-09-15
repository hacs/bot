// author.id: reason
const blockedAuthors: Record<number, string> = {
  1080226: 'The author deletes repositories.',
  18568434: 'The author deletes repositories.',
  38878996: 'The author deletes repositories.',
}

// repository.id: reason
const blockedRepositories: Record<number, string> = {
  149443194:
    'The repository was removed because it was causing issues with HACS and conflicting with other repositories.',
  1040046512:
    'The repository was removed because it was causing issues with HACS and conflicting with other repositories.',
}

export function isBlockedAuthor(authorId: number): boolean {
  return !!blockedAuthors[authorId]
}

export function isBlockedRepository(repoId: number): boolean {
  return !!blockedRepositories[repoId]
}
