// src/app/header/header.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  @Input() searchBarHide: boolean = false;

  searchTerm: string = '';
  errorMsg: string = '';
  successMsg: boolean = false;
  cartCount: number = 0;

  username: string = '';
  email: string = '';

  // login form
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
    password: ['', [Validators.required, Validators.pattern('[0-9a-zA-Z]*')]],
  });

  // register form
  registerForm = this.fb.group({
    username: ['', [Validators.required, Validators.pattern('[a-zA-Z ]*')]],
    email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
    password: ['', [Validators.required, Validators.pattern('[0-9a-zA-Z]*')]],
  });

  constructor(private api: ApiService, private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.username = localStorage.getItem('username') || '';
    this.email = localStorage.getItem('email') || '';

    this.api.cartCount.subscribe((data: any[]) => {
      this.cartCount = data.length;
    });
  }

  // search on input (emit to ApiService subject)
  search(event: any) {
    const val = (event.target.value || '').trim();
    this.searchTerm = val;
    // Debug
    // console.log('HEADER emit search:', val);
    this.api.searchKey.next(val);
  }

  // login
  login() {
    if (this.loginForm.valid) {
      const email = this.loginForm.value.email || '';
      const password = this.loginForm.value.password || '';

      this.api.login(email, password).subscribe(
        (result: any) => {
          // success
          this.successMsg = true;
          this.errorMsg = '';

          // store data
          localStorage.setItem('username', result.username || '');
          localStorage.setItem('email', result.email || email);
          localStorage.setItem('wishlist', JSON.stringify(result.wishlist || []));
          localStorage.setItem('cart', JSON.stringify(result.cart || []));
          localStorage.setItem('checkout', JSON.stringify(result.checkout || []));
          localStorage.setItem('token', result.token || '');

          // update caches
          this.api.apiWishlist = (result.wishlist || []).map((w: any) => w.productId);
          this.api.apiCart = (result.cart || []).map((c: any) => c.productId);
          this.api.cartCount.next(this.api.apiCart);

          // reload so header/home reflect changes
          setTimeout(() => window.location.reload(), 700);
        },
        (err: any) => {
          this.errorMsg = err?.error?.message || 'Login failed';
          setTimeout(() => {
            this.errorMsg = '';
            this.loginForm.reset();
          }, 3000);
        }
      );
    } else {
      alert('invalid inputs');
    }
  }

  // register
  register() {
    if (this.registerForm.valid) {
      const username = this.registerForm.value.username || '';
      const email = this.registerForm.value.email || '';
      const password = this.registerForm.value.password || '';

      this.api.register(username, email, password).subscribe(
        (result: any) => {
          alert(result.message || 'Registered, now login.');
          this.registerForm.reset();
        },
        (err: any) => {
          alert(err?.error?.message || 'Registration failed');
        }
      );
    } else {
      alert('invalid Input');
    }
  }

  logout() {
    localStorage.clear();
    this.api.apiCart = [];
    this.api.apiWishlist = [];
    this.api.cartCount.next([]);
    window.location.reload();
  }
}
