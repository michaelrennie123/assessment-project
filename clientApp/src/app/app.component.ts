import { Component } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { CustomersComponent } from './customers/customers.component';
import { _routes } from './routes';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CustomersComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'clientApp';
  constructor(private router: Router) {}

  navItems = _routes;

  isActiveRoute(route: string): boolean {
    return this.router.isActive(route, true);
  }
}
