import { AuthGuard } from './guards/auth.guard';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './core/home/home.component';
import { SalesComponent } from './core/sales/sales.component';
import { AdminComponent } from './core/admin/admin.component';
import { LoginComponent } from './core/login/login.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'promocje', component: SalesComponent},
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard]},
  { path: 'login', component: LoginComponent},
  { path: '', redirectTo: '/', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
