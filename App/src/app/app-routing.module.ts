import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './core/login/login.component';
import { SalesComponent } from './core/sales/sales.component';
import { HomeComponent } from './core/home/home.component';
import { AdminComponent } from './core/admin/admin.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'promocje', component: SalesComponent},
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard]},
  { path: 'login', component: LoginComponent},
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
