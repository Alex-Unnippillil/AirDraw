export interface Command {
  id: string;
  args: Record<string, any>;
  dryRun?: boolean;
}

export type CommandHandler = (args: Record<string, any>) => Promise<void> | void;

export class CommandBus {
  private handlers = new Map<string, CommandHandler>();
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];

  register(id: string, handler: CommandHandler) {
    this.handlers.set(id, handler);
  }

  async dispatch(cmd: Command) {
    if (cmd.dryRun) return;
    const handler = this.handlers.get(cmd.id);
    if (!handler) throw new Error(`No handler for ${cmd.id}`);
    await handler(cmd.args);
    this.undoStack.push(cmd);
    this.redoStack = [];
  }

  async undo(): Promise<void> {
    const cmd = this.undoStack.pop();
    if (!cmd) return;
    const handler = this.handlers.get(`undo:${cmd.id}`);
    if (handler) await handler(cmd.args);
    this.redoStack.push(cmd);
  }

  async redo(): Promise<void> {
    const cmd = this.redoStack.pop();
    if (!cmd) return;
    await this.dispatch(cmd);
  }
}
