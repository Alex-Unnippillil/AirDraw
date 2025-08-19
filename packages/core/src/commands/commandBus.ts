export type CommandHandler<Args> = (args: Args) => void | Promise<void>;

export type Command<ID extends string, Args> = {
  id: ID;
  args: Args;
};

export type CommandOf<M extends Record<string, unknown>> = {
  [K in keyof M]: { id: K; args: M[K] };
}[keyof M];

export class CommandBus<Cmds extends Record<string, unknown>> {
  private handlers = new Map<
    keyof Cmds & string,
    { do: CommandHandler<unknown>; undo?: CommandHandler<unknown> }
  >();
  private undoStack: Array<Command<keyof Cmds & string, Cmds[keyof Cmds]>> = [];
  private redoStack: Array<Command<keyof Cmds & string, Cmds[keyof Cmds]>> = [];

  register<ID extends keyof Cmds & string>(
    id: ID,
    handler: CommandHandler<Cmds[ID]>,
    undo?: CommandHandler<Cmds[ID]>
  ) {
    this.handlers.set(id, {
      do: handler as CommandHandler<unknown>,
      ...(undo ? { undo: undo as CommandHandler<unknown> } : {}),
    });
    return () => {
      this.handlers.delete(id);
    };
  }

  async dispatch<ID extends keyof Cmds>(cmd: Command<ID & string, Cmds[ID]>) {
    const entry = this.handlers.get(cmd.id);
    if (!entry) return;
    await entry.do(cmd.args);
    this.undoStack.push(
      cmd as Command<keyof Cmds & string, Cmds[keyof Cmds]>
    );
    this.redoStack = [];
  }

  async undo() {
    const cmd = this.undoStack.pop();
    if (!cmd) return;
    const entry = this.handlers.get(cmd.id);
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
    const entry = this.handlers.get(cmd.id);
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
