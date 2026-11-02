export type SessionState =
  | 'idle'
  | 'configuring'
  | 'ready'
  | 'in_progress'
  | 'handover_pending'
  | 'paused'
  | 'completed'
  | 'aborted';

export class SessionLifecycle {
  private state: SessionState = 'idle';
  private history: SessionState[] = ['idle'];

  public getState(): SessionState {
    return this.state;
  }

  public transitionTo(newState: SessionState): void {
    this.history.push(newState);
    this.state = newState;
  }

  public getHistory(): SessionState[] {
    return [...this.history];
  }

  public isGameActive(): boolean {
    return this.state === 'in_progress' || this.state === 'handover_pending';
  }

  public isFinished(): boolean {
    return this.state === 'completed' || this.state === 'aborted';
  }
}
