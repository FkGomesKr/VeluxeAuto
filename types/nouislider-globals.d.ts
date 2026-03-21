import type { API } from 'nouislider';

declare global {
  interface HTMLElement {
    noUiSlider?: API;
  }
}

export {};
