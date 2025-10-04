// src/app/view-product/view-product.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-view-product',
  templateUrl: './view-product.component.html',
  styleUrls: ['./view-product.component.css'],
})
export class ViewProductComponent implements OnInit {
  productId: any;
  product: any;
  products: any[] = [];
  filteredProducts: any[] = [];
  email: string = '';
  wishlistMsg: string = '';
  wishlist: number[] = [];
  cart: number[] = [];

  constructor(private activatedRoute: ActivatedRoute, private api: ApiService) {}

  ngOnInit(): void {
    this.email = localStorage.getItem('email') || '';

    // Load all products (for showing related items)
    this.api.getAllProducts().subscribe((res: any) => {
      this.products = res?.products || [];
      this.filteredProducts = [...this.products];
    });

    // subscribe to search (filter displayed list)
    this.api.searchKey.subscribe((term: string) => {
      const key = (term || '').toLowerCase().trim();
      if (!key) {
        this.filteredProducts = [...this.products];
      } else {
        this.filteredProducts = this.products.filter((p) =>
          (p.name || p.title || '').toLowerCase().includes(key)
        );
      }
    });

    // load wishlist/cart if logged
    if (this.email) {
      this.getMyItems();
    }

    // get productId from route and fetch detail
    this.activatedRoute.params.subscribe((params: any) => {
      this.productId = params['id'];
      if (this.productId) {
        this.api.viewProduct(this.productId).subscribe(
          (result: any) => {
            this.product = result.product || this.products.find((p) => p.id == this.productId);
            // graceful fallback if no product found
            if (!this.product) {
              this.product = {
                id: this.productId,
                name: 'Product not found',
                price: 0,
                description: '',
                category: '',
                image: 'https://via.placeholder.com/400x300?text=No+Product',
              };
            }
          },
          (err: any) => {
            // fallback to cached product
            this.product = this.api.products.find((p) => p.id == this.productId);
          }
        );
      }
    });
  }

  addToWishlist(productId: any) {
    if (!this.email) return alert('Login to add to wishlist!');
    this.api.addToWishlist(this.email, productId).subscribe(
      (result: any) => {
        this.wishlistMsg = result.message;
        this.getMyItems();
        setTimeout(() => (this.wishlistMsg = ''), 3000);
      },
      (err: any) => (this.wishlistMsg = err?.error?.message || 'Error')
    );
  }

  removeFromWishlist(productId: any) {
    if (!this.email) return alert('Login to remove wishlist!');
    this.api.removeFromWishlist(this.email, productId).subscribe(
      (result: any) => {
        this.wishlistMsg = result.message;
        this.getMyItems();
        setTimeout(() => (this.wishlistMsg = ''), 3000);
      },
      (err: any) => (this.wishlistMsg = err?.error?.message || 'Error')
    );
  }

  addToCart(productId: any) {
    if (!this.email) return alert('Login to add to cart!');
    this.api.addToCart(this.email, productId, 1).subscribe(
      (result: any) => {
        this.wishlistMsg = result.message;
        this.getMyItems();
        setTimeout(() => (this.wishlistMsg = ''), 3000);
      },
      (err: any) => (this.wishlistMsg = err?.error?.message || 'Error')
    );
  }

  removeFromCart(productId: any) {
    this.api.removeFromCart(this.email, productId).subscribe(
      (result: any) => {
        this.wishlistMsg = result.message;
        this.getMyItems();
        setTimeout(() => (this.wishlistMsg = ''), 3000);
      },
      (err: any) => (this.wishlistMsg = err?.error?.message || 'Error')
    );
  }

  getMyItems() {
    this.api.getWishlist(this.email).subscribe(
      (result: any) => {
        this.cart = (result.cart || []).map((i: any) => i.productId);
        this.api.apiCart = [...this.cart];
        this.api.cartCount.next(this.cart);

        this.wishlist = (result.wishlist || []).map((i: any) => i.productId);
        this.api.apiWishlist = [...this.wishlist];

        localStorage.setItem('username', result.username || '');
        localStorage.setItem('email', result.email || '');
        localStorage.setItem('wishlist', JSON.stringify(result.wishlist || []));
        localStorage.setItem('cart', JSON.stringify(result.cart || []));
        localStorage.setItem('token', result.token || '');
      },
      (err: any) => console.log(err?.error?.message || err)
    );
  }
}
