export type CommandHandler<Args> = (args: Args) => void | Promise<void>;

export type Command<ID extends string, Args> = {
  id: ID;
  args: Args;
};

export type CommandOf<M extends Record<string, any>> = {
  [K in keyof M]: { id: K; args: M[K] };
}[keyof M];

export class CommandBus<Cmds extends Record<string, any>> {
  private handlers = new Map<
    string,
    { do: CommandHandler<any>; undo?: CommandHandler<any> }
  >();
  private undoStack: Array<Command<keyof Cmds & string, any>> = [];
  private redoStack: Array<Command<keyof Cmds & string, any>> = [];

  register<ID extends string, Args>(
    id: ID,
    handler: CommandHandler<Args>,
    undo?: CommandHandler<Args>
  ) {
    this.handlers.set(id, {
      do: handler as CommandHandler<any>,
      ...(undo ? { undo: undo as CommandHandler<any> } : {}),
    });
    return () => {
      this.handlers.delete(id);
    };
  }

  async dispatch<ID extends keyof Cmds>(cmd: Command<ID & string, Cmds[ID]>) {
    const entry = this.handlers.get(cmd.id as string);
    if (!entry) return;
    try {
      await entry.do(cmd.args);
      this.undoStack.push(cmd as Command<keyof Cmds & string, any>);
      this.redoStack = [];
    } catch (err) {
      throw err;
    }
  }

  async undo() {
    const cmd = this.undoStack.pop();
    if (!cmd) return;
    const entry = this.handlers.get(String(cmd.id));
    const handler = entry?.undo;
    if (!handler) {
      // Restore state when there is no inverse handler
      this.undoStack.push(cmd);
      return;
    }
    try {
      await handler(cmd.args);
      this.redoStack.push(cmd);
    } catch (err) {
      this.undoStack.push(cmd);
      throw err;
    }
  }

  async redo() {
    const cmd = this.redoStack.pop();
    if (!cmd) return;
    const entry = this.handlers.get(String(cmd.id));
    const handler = entry?.do;
    if (!handler) {
      // Restore state if redo handler is missing
      this.redoStack.push(cmd);
      return;
    }
    try {
      await handler(cmd.args);
      this.undoStack.push(cmd);
    } catch (err) {
      this.redoStack.push(cmd);
      throw err;
    }
  }
}
