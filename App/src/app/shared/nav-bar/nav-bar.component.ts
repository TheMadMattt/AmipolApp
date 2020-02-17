import { AuthService } from './../../services/auth.service';
import { User } from './../../models/user';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent {
  currentUser: User;

  constructor(private router: Router, private authService: AuthService) {
    this.authService.currentUser.subscribe(x => this.currentUser = x);
   }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
