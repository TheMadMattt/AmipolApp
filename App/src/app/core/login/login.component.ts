import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  returnUrl: string;
  error = '';
  loginError = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    // redirect to home if already logged in
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    document.getElementById('navbar').style.display = 'block';

    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/';
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    const user: User = {
      Name: null,
      Username: this.f.username.value,
      Password: this.f.password.value
    };
    this.authService.login(user)
      .pipe(first())
      .subscribe(
        data => {
          if (data) {
            this.loginError = false;
            this.router.navigate([this.returnUrl]);
          } else {
            this.router.navigate(['/login']);
            this.loginError = true;
            this.loading = false;
          }
        },
        error => {
          this.error = 'Wystąpił błąd podczas logowania';
          this.loading = false;
        });
  }

}
