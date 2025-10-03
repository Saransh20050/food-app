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
  searchTerm: string = '';
  errorMsg: string = '';
  successMsg: boolean = false;
  cartCount: number = 0;

  @Input() searchBarHide: boolean = false;

  username: string = '';
  email: string = '';

  // ------------------ Login Form ------------------
  loginForm = this.fb.group({
    email: [
      '',
      [
        Validators.required,
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
      ],
    ],
    password: ['', [Validators.required, Validators.pattern('[0-9a-zA-Z]*')]],
  });

  // ------------------ Register Form ------------------
  registerForm = this.fb.group({
    username: ['', [Validators.required, Validators.pattern('[a-zA-Z]*')]],
    email: [
      '',
      [
        Validators.required,
        Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
      ],
    ],
    password: ['', [Validators.required, Validators.pattern('[0-9a-zA-Z]*')]],
  });

  constructor(
    private api: ApiService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  // ------------------ Login ------------------
  login() {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value as { email: string; password: string };
      const email = loginData.email;
      const password = loginData.password;

      this.api.login(email, password).subscribe(
        (result: any) => {
          this.successMsg = true;

          // Store user details & token in localStorage
          localStorage.setItem('username', result.username);
          localStorage.setItem('email', result.email);
          localStorage.setItem('wishlist', JSON.stringify(result.wishlist));
          localStorage.setItem('cart', JSON.stringify(result.cart));
          localStorage.setItem('checkout', JSON.stringify(result.checkout || []));
          localStorage.setItem('token', result.token);

          // Update ApiService caches
          this.api.apiWishlist = result.wishlist.map((i: any) => i.productId);
          this.api.apiCart = result.cart.map((i: any) => i.productId);
          this.api.cartCount.next(this.api.apiCart);

          setTimeout(() => window.location.reload(), 1000);
        },
        (err: any) => {
          this.errorMsg = err.error.message;
          setTimeout(() => {
            this.errorMsg = '';
            this.loginForm.reset();
          }, 3000);
        }
      );
    } else {
      alert('Invalid inputs');
    }
  }

  // ------------------ Register ------------------
  register() {
    if (this.registerForm.valid) {
      const registerData = this.registerForm.value as { username: string; email: string; password: string };
      const { username, email, password } = registerData;

      this.api.register(username, email, password).subscribe(
        (result: any) => {
          alert(result.message);
          this.registerForm.reset();
          window.location.reload();
        },
        (err: any) => {
          alert(err.error.message);
        }
      );
    } else {
      alert('Invalid input');
    }
  }

  // ------------------ Logout ------------------
  logout() {
    localStorage.clear();
    this.api.apiCart = [];
    this.api.apiWishlist = [];
    this.api.cartCount.next([]);
    window.location.reload();
  }

  // ------------------ Search ------------------
  search(event: any) {
    this.searchTerm = event.target.value;
    this.api.searchKey.next(this.searchTerm.trim());
  }

  // ------------------ Init ------------------
  ngOnInit(): void {
    this.username = localStorage.getItem('username') || '';
    this.email = localStorage.getItem('email') || '';

    this.api.cartCount.subscribe((cartIds: number[]) => {
      this.cartCount = cartIds.length;
    });
  }
}
