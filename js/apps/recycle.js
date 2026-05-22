import { wm } from '../wm.js';
import { recycleIcon } from '../icons.js';

export function openRecycle() {
  return wm.open({
    id: 'recycle',
    title: 'Recycle Bin',
    icon: recycleIcon,
    content: `
      <div style="display:flex;align-items:center;justify-content:center;height:100%;color:#666;font-style:italic;">
        <div style="text-align:center">
          <p style="font-size:14px">The Recycle Bin is empty.</p>
          <p style="font-size:12px;margin-top:8px;color:#888">(Nothing to see here. Yet.)</p>
        </div>
      </div>
    `,
    width: 360,
    height: 220,
  });
}
