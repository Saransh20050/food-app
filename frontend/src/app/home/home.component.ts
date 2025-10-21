import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  searchItem: string = '';
  email: string = '';
  username: string = '';
  wishlistMsg: string = '';

  // store full product objects for wishlist/cart
  wishlistFull: any[] = [];
  cartFull: any[] = [];

  // keep productIds for heart/cart logic
  wishlist: number[] = [];
  cart: number[] = [];

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.email = localStorage.getItem('email') || '';
    this.username = localStorage.getItem('username') || '';

    if (this.email) {
      this.getMyItems();
    }

    // fetch products once
    this.api.getAllProducts().subscribe(
      (res: any) => {
        this.products = res?.products || [];
        this.filteredProducts = [...this.products];
        this.api.products = this.products;
        localStorage.setItem('products', JSON.stringify(this.products));
      },
      (err: any) => console.error('Error fetching products', err)
    );

    // subscribe to search key with debounce
    this.api.searchKey
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe((key: string) => {
        this.searchItem = key || '';
        this.filterProducts();
      });
  }

  // client-side filter
  filterProducts() {
    const key = (this.searchItem || '').toLowerCase().trim();
    if (!key) {
      this.filteredProducts = [...this.products];
      return;
    }
    this.filteredProducts = this.products.filter((product) => {
      const fields = [
        product.name || product.title || '',
        product.title || product.name || '',
        product.category || '',
        product.description || '',
      ];
      return fields.some((f: string) => f.toLowerCase().includes(key));
    });
  }

  // wishlist/cart actions
  addToWishlist(productId: number) {
    if (!this.email) return;
    this.api.addToWishlist(this.email, productId).subscribe(
      (res: any) => {
        this.wishlistMsg = res.message;
        this.getMyItems();
        setTimeout(() => (this.wishlistMsg = ''), 5000);
      },
      (err: any) => (this.wishlistMsg = err?.error?.message || 'Error')
    );
  }

  removeFromWishlist(productId: number) {
    if (!this.email) return;
    this.api.removeFromWishlist(this.email, productId).subscribe(
      (res: any) => {
        this.wishlistMsg = res.message;
        this.getMyItems();
        setTimeout(() => (this.wishlistMsg = ''), 5000);
      },
      (err: any) => (this.wishlistMsg = err?.error?.message || 'Error')
    );
  }

  addToCart(productId: number) {
    if (!this.email) return alert('Please login to add to cart');
    this.api.addToCart(this.email, productId, 1).subscribe(
      (res: any) => {
        this.wishlistMsg = res.message;
        this.getMyItems();
        setTimeout(() => (this.wishlistMsg = ''), 5000);
      },
      (err: any) => (this.wishlistMsg = err?.error?.message || 'Error')
    );
  }

  removeFromCart(productId: number) {
    if (!this.email) return;
    this.api.removeFromCart(this.email, productId).subscribe(
      (res: any) => {
        this.wishlistMsg = res.message;
        this.getMyItems();
        setTimeout(() => (this.wishlistMsg = ''), 5000);
      },
      (err: any) => (this.wishlistMsg = err?.error?.message || 'Error')
    );
  }

  // fetch full wishlist and cart info
  getMyItems() {
    if (!this.email) return;
    this.api.getWishlist(this.email).subscribe(
      (res: any) => {
        this.wishlistFull = res.wishlist || [];
        this.cartFull = res.cart || [];

        this.wishlist = this.wishlistFull.map((i: any) => i.productId);
        this.cart = this.cartFull.map((i: any) => i.productId);

        this.api.apiWishlist = [...this.wishlist];
        this.api.apiCart = [...this.cart];
        this.api.cartCount.next(this.api.apiCart);

        localStorage.setItem('wishlist', JSON.stringify(this.wishlistFull));
        localStorage.setItem('cart', JSON.stringify(this.cartFull));

        localStorage.setItem('username', res.username || '');
        localStorage.setItem('email', res.email || '');
        localStorage.setItem('token', res.token || '');
      },
      (err: any) => console.error('Error getMyItems', err)
    );
  }
}
