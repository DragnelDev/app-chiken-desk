import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  templateUrl: './stat-card.component.html',
})
export class StatCardComponent {
  // uppercase label, ej. "VENTAS DE HOY"
  label = input.required<string>();
  // valor grande, ej. "$2,450.00" o "12 / 20"
  value = input.required<string>();
  // texto de apoyo bajo el valor, ej. "↑ 15% vs ayer"
  hint = input<string>('');
  // color del hint: 'brand' (rojo/positivo), 'amber', 'blue', 'violet'
  hintColor = input<'brand' | 'amber' | 'blue' | 'violet'>('brand');

  // Clases completas y literales (Tailwind necesita verlas tal cual para no purgarlas)
  private readonly hintColorMap = {
    brand: 'text-brand',
    amber: 'text-amber-500',
    blue: 'text-blue-500',
    violet: 'text-violet-500',
  } as const;

  get hintClass(): string {
    return this.hintColorMap[this.hintColor()];
  }
}
