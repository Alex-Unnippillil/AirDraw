export interface Command<TId extends string = string, TArgs = unknown> {
  id: TId;
  args: TArgs;
  dryRun?: boolean;
}

export type CommandHandler<TArgs = unknown> = (
  args: TArgs
) => Promise<void> | void;

export type CommandMap = Record<string, any>;

export type CommandOf<T extends CommandMap> = {
  [K in keyof T]: Command<K & string, T[K]>;
}[keyof T];

export class CommandBus<T extends CommandMap = CommandMap> {
  private handlers = new Map<string, CommandHandler<any>>();
  private undoStack: CommandOf<T>[] = [];
  private redoStack: CommandOf<T>[] = [];

  register<K extends keyof T>(id: K, handler: CommandHandler<T[K]>) {
    this.handlers.set(id as string, handler as CommandHandler<any>);
  }

  async dispatch(cmd: CommandOf<T>) {
    if (cmd.dryRun) return;
    const handler = this.handlers.get(cmd.id as string);
    if (!handler) throw new Error(`No handler for ${cmd.id}`);
    await handler(cmd.args);
    this.undoStack.push(cmd);
    this.redoStack = [];
  }

  undo() {
    const cmd = this.undoStack.pop();
    if (!cmd) return;
    const handler = this.handlers.get(`undo:${cmd.id}`);
    if (handler) handler(cmd.args);
    this.redoStack.push(cmd);
  }

  redo() {
    const cmd = this.redoStack.pop();
    if (!cmd) return;
    this.dispatch(cmd);
  }
}
