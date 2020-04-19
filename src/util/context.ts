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
  repo: repo = {
    owner: this.payload.owner,
    repo: this.payload.repo,
  };
  pull: pull = {
    owner: this.payload.owner,
    repo: this.payload.repo,
    pull_number: this.payload.number,
  };
  issue: issue = {
    owner: this.payload.owner,
    repo: this.payload.repo,
    issue_number: this.payload.number,
  };
  constructor(payload: payload) {
    this.payload = payload;
  }
}
