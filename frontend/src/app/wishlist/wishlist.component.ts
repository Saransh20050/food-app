import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css'],
})
export class WishlistComponent implements OnInit {
  email: string = '';
  cart: number[] = [];
  wishlist: number[] = [];
  products: any[] = [];
  allProducts: any[] = [];
  searchItem: string = '';
  wishlistStatus: boolean = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.email = localStorage.getItem('email') || '';
    this.allProducts = JSON.parse(localStorage.getItem('products') || '[]');

    if (this.email) this.getMyItems();

    this.api.searchKey.subscribe((result: any) => {
      this.searchItem = result || '';
    });
  }

  getMyItems() {
    this.api.getWishlist(this.email).subscribe(
      (result: any) => {
        this.wishlistStatus = result.wishlist.length !== 0;
        const wishlistItems = result.wishlist || [];
        const cartItems = result.cart || [];

        this.wishlist = wishlistItems.map((item: any) => item.productId);
        this.cart = cartItems.map((item: any) => item.productId);

        this.api.apiWishlist = this.wishlist;
        this.api.apiCart = this.cart;
        this.api.cartCount.next(this.cart);

        // Map wishlist items to the full 'product' object returned by the back-end.
        this.products = wishlistItems
          .map((item: any) => item.product)
          .filter((p: any) => p != null); // Ensure we only include valid products

        localStorage.setItem('username', result.username);
        localStorage.setItem('email', result.email);
        localStorage.setItem('wishlist', JSON.stringify(result.wishlist));
        localStorage.setItem('cart', JSON.stringify(result.cart));
        localStorage.setItem('token', result.token);
      },
      (err: any) => console.log(err)
    );
  }

  removeFromWishlist(productId: any) {
    this.api.removeFromWishlist(this.email, productId).subscribe(() => this.getMyItems());
  }

  addToCart(productId: any, count: any) {
    this.api.addToCart(this.email, productId, count).subscribe(() => this.getMyItems());
  }

  removeFromCart(productId: any) {
    this.api.removeFromCart(this.email, productId).subscribe(() => this.getMyItems());
  }
}