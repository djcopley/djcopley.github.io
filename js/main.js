import { bootDesktop } from './desktop.js';
import { bootMobile } from './mobile.js';

const isMobile = window.matchMedia('(max-width: 768px)').matches;

if (isMobile) {
  bootMobile();
} else {
  bootDesktop();
}
