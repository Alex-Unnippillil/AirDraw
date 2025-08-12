import { AppCommand } from '../commands';


  if (/undo/i.test(prompt)) return [{ id: 'undo', args: {} }];
  if (/red/i.test(prompt)) return [{ id: 'setColor', args: { hex: '#ff0000' } }];
  return [];
}

