import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'nexusrest-theme';

/**
 * Maneja el modo claro/oscuro de todo el sistema (Landing + Dashboard + POS + KDS).
 * Funciona añadiendo/quitando la clase "dark" en <html>, que es lo que
 * activa las variantes `dark:` de Tailwind (ver tailwind.config.js, darkMode: 'class').
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  // signal reactivo: cualquier componente puede leer theme() para pintar el icono correcto
  readonly theme = signal<Theme>('light');

  init(): void {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    this.set(saved ?? (prefersDark ? 'dark' : 'light'));
  }

  toggle(): void {
    this.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  set(theme: Theme): void {
    this.theme.set(theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(STORAGE_KEY, theme);
  }
}
