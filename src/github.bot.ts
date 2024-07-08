import { Toucan } from 'toucan-js'
import { plugins } from './plugins'
import { issuePull, release } from './utils/eventPayloads'
import { EmitterWebhookEvent } from '@octokit/webhooks'
import { IssuePullPayload } from './types'

export class GitHubBot {
  private request: Request
  private env: Record<string, string>
  private _sentry: Toucan | undefined = undefined

  constructor(options: { request: Request; env: Record<string, string> }) {
    this.request = options.request
    this.env = options.env
  }

  public get sentry(): Toucan {
    if (!this._sentry) {
      this._sentry = new Toucan({
        dsn: this.env.SENTRY_DSN,
        requestDataOptions: {
          allowedHeaders: ['user-agent', 'cf-ray'],
        },
        request: this.request,
        initialScope: {
          tags: {},
        },
      })
    }
    return this._sentry
  }

  async internalProcessRequest(
    rawPayload: Record<string, unknown>,
  ): Promise<void> {
    this.sentry.setTransactionName('processRequest')
    const rawBody = { payload: rawPayload } as EmitterWebhookEvent
    const eventName = this.request.headers.get('x-github-event') as string
    const payload = issuePull(rawBody) || release(rawBody)
    if (!payload) {
      return
    }
    for (const handler of [...plugins.base, ...plugins[eventName]]) {
      await handler(this, payload as IssuePullPayload)
    }
  }

  public async processRequest(
    rawPayload: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.internalProcessRequest(rawPayload)
    } catch (err) {
      this.sentry.captureException(err)
      throw err
    }
  }
}
