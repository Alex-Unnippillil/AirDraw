export type CommandHandler<Args> = (args: Args) => void | Promise<void>;

export type Command<ID extends string, Args> = {
  id: ID;
  args: Args;
};

export class CommandBus<Cmds extends Record<string, any>> {
  private handlers = new Map<string, CommandHandler<any>>();
  private undoStack: Array<Command<keyof Cmds & string, any>> = [];
  private redoStack: Array<Command<keyof Cmds & string, any>> = [];

  register<ID extends string, Args>(id: ID, handler: CommandHandler<Args>) {
    this.handlers.set(id, handler as CommandHandler<any>);
  }

  async dispatch<ID extends keyof Cmds>(cmd: Command<ID & string, Cmds[ID]>) {
    const handler = this.handlers.get(cmd.id as string);
    if (!handler) return;
    await handler(cmd.args);
    this.undoStack.push(cmd as Command<keyof Cmds & string, any>);
    this.redoStack = [];
  }

  async undo() {
    const cmd = this.undoStack.pop();
    if (!cmd) return;
    const handler = this.handlers.get(`undo:${String(cmd.id)}`);
    if (!handler) {
      // Restore state when there is no inverse handler
      this.undoStack.push(cmd);
      return;
    }
    await handler(cmd.args);
    this.redoStack.push(cmd);
  }

  async redo() {
    const cmd = this.redoStack.pop();
    if (!cmd) return;
    const handler = this.handlers.get(String(cmd.id));
    if (!handler) {
      // Restore state if redo handler is missing
      this.redoStack.push(cmd);
      return;
    }
    await handler(cmd.args);
    this.undoStack.push(cmd);
  }
}
