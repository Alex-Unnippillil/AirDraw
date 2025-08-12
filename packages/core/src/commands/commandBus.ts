export type CommandMap = Record<string, unknown>;

export interface Command<C extends CommandMap = CommandMap, K extends keyof C = keyof C> {
  id: K;
  args: C[K];
  dryRun?: boolean;
}

export type CommandHandler<Args> = (args: Args) => Promise<void> | void;

export class CommandBus<C extends CommandMap = CommandMap> {
  private handlers = new Map<keyof C | `undo:${string & keyof C}`, CommandHandler<unknown>>();
  private undoStack: Command<C>[] = [];
  private redoStack: Command<C>[] = [];

  register<K extends keyof C>(id: K | `undo:${string & K}`, handler: CommandHandler<C[K]>) {
    this.handlers.set(id, handler as CommandHandler<unknown>);
  }

  unregister<K extends keyof C>(id: K | `undo:${string & K}`) {
    this.handlers.delete(id);
  }

  async dispatch<K extends keyof C>(cmd: Command<C, K>) {
    if (cmd.dryRun) return;
    const handler = this.handlers.get(cmd.id) as CommandHandler<C[K]> | undefined;
    if (!handler) throw new Error(`No handler for ${String(cmd.id)}`);
    await handler(cmd.args);
    this.undoStack.push(cmd);
    this.redoStack = [];
  }

  undo() {
    const cmd = this.undoStack.pop();
    if (!cmd) return;
    const handler = this.handlers.get(`undo:${String(cmd.id)}` as `undo:${string & keyof C}`) as
      | CommandHandler<C[keyof C]>
      | undefined;
    if (handler) {
      handler(cmd.args as C[keyof C]);
      this.redoStack.push(cmd);
    } else {
      this.undoStack.push(cmd);
    }
  }

  async redo() {
    const cmd = this.redoStack.pop();
    if (!cmd) return;
    await this.dispatch(cmd as Command<C, keyof C>);
  }
}
