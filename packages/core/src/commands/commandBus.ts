export interface Command<TArgs = Record<string, unknown>> {
  id: string;
  args: TArgs;
  dryRun?: boolean;
}

export type CommandHandler<TArgs> = (args: TArgs) => Promise<void> | void;

export class CommandBus<TArgs = Record<string, unknown>> {
  private handlers = new Map<string, CommandHandler<TArgs>>();
  private undoStack: Command<TArgs>[] = [];
  private redoStack: Command<TArgs>[] = [];

  register(id: string, handler: CommandHandler<TArgs>) {
    this.handlers.set(id, handler);
  }

  async dispatch(cmd: Command<TArgs>) {
    if (cmd.dryRun) return;
    const handler = this.handlers.get(cmd.id);
    if (!handler) throw new Error(`No handler for ${cmd.id}`);
    await handler(cmd.args);
    this.undoStack.push(cmd);
    this.redoStack = [];
  }

  async undo() {
    const cmd = this.undoStack.pop();
    if (!cmd) return;
    const handler = this.handlers.get(`undo:${cmd.id}`);
    if (handler) await handler(cmd.args);
    this.redoStack.push(cmd);
  }

  async redo() {
    const cmd = this.redoStack.pop();
    if (!cmd) return;
    await this.dispatch(cmd);
  }
}
