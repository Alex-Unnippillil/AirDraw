# RadialPalette Component

The `RadialPalette` component renders a menu of drawing commands. Items are presented in a radial layout and can be fully navigated with the keyboard.

## Props

### `items?: PaletteItem[]`
List of palette entries to display. Each item has a `label` and a `command`. Defaults to `defaultPaletteItems` from `packages/web/src/config/palette`.

### `onSelect?: (command: Command) => void`
Callback invoked when a palette item is chosen via click or keyboard activation.

## Accessibility

The component uses `role="menu"` and `role="menuitem"` semantics and implements roving tabindex. The arrow keys cycle focus through the items, wrapping from end to start. Press `Enter` or `Space` to activate the focused item.

