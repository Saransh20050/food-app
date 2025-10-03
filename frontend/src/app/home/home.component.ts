import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  products: any[] = [];
  searchItem: string = '';
  email: string = '';
  username: string = '';
  wishlistMsg: string = '';
  wishlist: number[] = [];
  cart: number[] = [];

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    // Get user info from localStorage
    this.email = localStorage.getItem('email') || '';
    this.username = localStorage.getItem('username') || '';

    // Fetch wishlist/cart for logged-in users
    if (this.email) {
      this.getMyItems();
    }

    // Fetch all products
    this.api.getAllProducts().subscribe(
      (res: any) => {
        this.products = res.products || [];
        this.api.products = this.products;
        localStorage.setItem('products', JSON.stringify(this.products));
      },
      (err: any) => console.error('Error fetching products', err)
    );

    // Subscribe to search input from header
    this.api.searchKey.subscribe((key: string) => {
      this.searchItem = key || '';
    });
  }

  // Filter products dynamically for search
  get filteredProducts() {
    if (!this.searchItem) return this.products;
    return this.products.filter((p) =>
      p.title.toLowerCase().includes(this.searchItem.toLowerCase())
    );
  }

  // ------------------ Wishlist ------------------
  addToWishlist(productId: number) {
    if (!this.email) return;
    this.api.addToWishlist(this.email, productId).subscribe(
      (res: any) => {
        this.wishlistMsg = res.message;
        this.api.wishlistMsg = res.message;
        this.getMyItems();
        setTimeout(() => (this.wishlistMsg = ''), 5000);
      },
      (err: any) => {
        this.wishlistMsg = err.error?.message || 'Error adding to wishlist';
      }
    );
  }

  removeFromWishlist(productId: number) {
    if (!this.email) return;
    this.api.removeFromWishlist(this.email, productId).subscribe(
      (res: any) => {
        this.wishlistMsg = res.message;
        this.api.wishlistMsg = res.message;
        this.getMyItems();
        setTimeout(() => (this.wishlistMsg = ''), 5000);
      },
      (err: any) => {
        this.wishlistMsg = err.error?.message || 'Error removing from wishlist';
      }
    );
  }

  // ------------------ Cart ------------------
  addToCart(productId: number) {
    if (!this.email) return;
    this.api.addToCart(this.email, productId, 1).subscribe(
      (res: any) => {
        this.wishlistMsg = res.message;
        this.api.wishlistMsg = res.message;
        this.getMyItems();
        setTimeout(() => (this.wishlistMsg = ''), 5000);
      },
      (err: any) => {
        this.wishlistMsg = err.error?.message || 'Error adding to cart';
      }
    );
  }

  removeFromCart(productId: number) {
    if (!this.email) return;
    this.api.removeFromCart(this.email, productId).subscribe(
      (res: any) => {
        this.wishlistMsg = res.message;
        this.api.wishlistMsg = res.message;
        this.getMyItems();
        setTimeout(() => (this.wishlistMsg = ''), 5000);
      },
      (err: any) => {
        this.wishlistMsg = err.error?.message || 'Error removing from cart';
      }
    );
  }

  // ------------------ Fetch wishlist & cart ------------------
  getMyItems() {
    if (!this.email) return;

    this.api.getWishlist(this.email).subscribe(
      (res: any) => {
        // Update wishlist & cart arrays
        this.wishlist = res.wishlist.map((item: any) => item.productId);
        this.cart = res.cart.map((item: any) => item.productId);

        // Update ApiService caches
        this.api.apiWishlist = [...this.wishlist];
        this.api.apiCart = [...this.cart];
        this.api.cartCount.next(this.cart);

        // Store user data locally
        localStorage.setItem('username', res.username);
        localStorage.setItem('email', res.email);
        localStorage.setItem('wishlist', JSON.stringify(res.wishlist));
        localStorage.setItem('cart', JSON.stringify(res.cart));
        localStorage.setItem('token', res.token);
      },
      (err: any) => console.error('Error fetching user items', err)
    );
  }
}
