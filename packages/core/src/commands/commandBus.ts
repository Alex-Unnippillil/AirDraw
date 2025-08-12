
  args: TArgs;
  dryRun?: boolean;
}


    if (cmd.dryRun) return;
    const handler = this.handlers.get(cmd.id as string);
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
