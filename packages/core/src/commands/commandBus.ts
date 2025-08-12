
    await handler(cmd.args);
    this.undoStack.push(cmd);
    this.redoStack = [];
  }


    const cmd = this.undoStack.pop();
    if (!cmd) return;

}
