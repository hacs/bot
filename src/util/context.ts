export interface repo {
  owner: string;
  repo: string;
}

interface payload extends repo {
  number: number;
}

interface pull extends repo {
  pull_number: number;
}

interface issue extends repo {
  issue_number: number;
}

export class contextData {
  payload!: payload;
  repo: repo;
  pull: pull;
  issue: issue;
  constructor(payload: payload) {
    this.payload = payload;
    this.repo = {
      owner: payload.owner,
      repo: payload.repo,
    };
    this.pull = {
      owner: payload.owner,
      repo: payload.repo,
      pull_number: payload.number,
    };
    this.issue = {
      owner: payload.owner,
      repo: payload.repo,
      issue_number: payload.number,
    };
  }
}
