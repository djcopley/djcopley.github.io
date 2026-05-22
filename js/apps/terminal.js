import { wm } from '../wm.js';
import { terminalIcon } from '../icons.js';

const HELP = [
  'Available commands:',
  '  help            show this help',
  '  whoami          show current user',
  '  ls              list contents of home',
  '  cat README      print README',
  '  date            print current date',
  '  echo <text>     echo text',
  '  clear           clear the screen',
  '  sudo <cmd>      try to sudo',
  '  exit            close the terminal',
].join('\n');

const FILES = {
  'README': "Daniel Copley\nEngineer. Builder.\nhttps://github.com/djcopley\n",
};

function runCommand(line) {
  const trimmed = line.trim();
  if (!trimmed) return '';
  const [cmd, ...rest] = trimmed.split(/\s+/);
  const arg = rest.join(' ');
  switch (cmd) {
    case 'help': return HELP;
    case 'whoami': return 'guest';
    case 'ls': return 'README   projects/   blog/';
    case 'cat':
      if (FILES[arg]) return FILES[arg];
      return `cat: ${arg}: No such file or directory`;
    case 'date': return new Date().toString();
    case 'echo': return arg;
    case 'clear': return '__CLEAR__';
    case 'sudo':
      if (arg === 'make me a sandwich') return 'Okay. 🥪';
      return `[sudo] password for guest: \nSorry, try again.`;
    case 'exit': return '__EXIT__';
    default: return `${cmd}: command not found`;
  }
}

export function openTerminal() {
  const term = document.createElement('div');
  term.className = 'terminal';

  const win = wm.open({
    id: 'terminal',
    title: 'Terminal',
    icon: terminalIcon,
    content: term,
    width: 560,
    height: 360,
    bodyClass: 'flush',
  });

  const writeLine = (text, cls) => {
    const div = document.createElement('div');
    if (cls) div.className = cls;
    div.textContent = text;
    term.appendChild(div);
    term.scrollTop = term.scrollHeight;
  };

  writeLine('Microsoft(R) Windows 95');
  writeLine('(C) Copyright Microsoft Corp 1981-1995.');
  writeLine('');
  writeLine("Type 'help' for a list of commands.");
  writeLine('');

  const promptEl = document.createElement('div');
  promptEl.innerHTML = `<span class="prompt">C:\\&gt;</span> <input type="text" autocomplete="off" spellcheck="false" autofocus/>`;
  term.appendChild(promptEl);

  const input = promptEl.querySelector('input');
  setTimeout(() => input.focus(), 0);
  term.addEventListener('click', () => input.focus());

  let history = [];
  let histPos = -1;

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const value = input.value;
      const echo = document.createElement('div');
      echo.innerHTML = `<span class="prompt">C:\\&gt;</span> ${value.replace(/</g, '&lt;')}`;
      term.insertBefore(echo, promptEl);
      const out = runCommand(value);
      if (out === '__CLEAR__') {
        term.querySelectorAll('div').forEach(d => { if (d !== promptEl) d.remove(); });
      } else if (out === '__EXIT__') {
        win.close();
        return;
      } else if (out) {
        const o = document.createElement('div');
        o.textContent = out;
        term.insertBefore(o, promptEl);
      }
      if (value.trim()) history.push(value);
      histPos = history.length;
      input.value = '';
      term.scrollTop = term.scrollHeight;
    } else if (e.key === 'ArrowUp') {
      if (histPos > 0) { histPos -= 1; input.value = history[histPos] || ''; }
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      if (histPos < history.length - 1) { histPos += 1; input.value = history[histPos] || ''; }
      else { histPos = history.length; input.value = ''; }
      e.preventDefault();
    }
  });

  return win;
}
