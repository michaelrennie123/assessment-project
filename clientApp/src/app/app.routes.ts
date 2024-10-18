import { Routes } from '@angular/router';
import { CustomersComponent } from './customers/customers.component';
import { _routes } from './routes';

export const routes: Routes = [
  { path: '', redirectTo: _routes[0].path, pathMatch: 'full' },
  ..._routes,
];
