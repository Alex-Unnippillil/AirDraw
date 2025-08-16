# Supported Commands

The following commands can be dispatched through the command bus and are used by the default radial palette:

- `setColor` – expects an object with a `hex` field specifying the color.
- `undo` – reverses the last action.
- `redo` – reapplies the last undone action. Both keyboard gestures and the radial palette can trigger it.
