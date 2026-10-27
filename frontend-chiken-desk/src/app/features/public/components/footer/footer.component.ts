import { Component } from '@angular/core';

@Component({
  selector: 'app-public-footer',
  standalone: true,
  template: `
    <footer class="border-t border-gray-100 bg-surface-light-card py-6 text-center text-sm text-gray-500 dark:border-surface-dark-border dark:bg-surface-dark-card dark:text-gray-400">
      &copy; 2026 ChikenDesk. Todos los derechos reservados.
    </footer>
  `,
})
export class PublicFooterComponent {}
