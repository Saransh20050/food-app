import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  email: string = '';
  cartItemCount: number = 0;
  total: number = 0;
  cart: any[] = [];
  products: any[] = [];
  allProducts: any[] = [];
  select: number[] = [1, 2, 3, 4, 5];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.email = localStorage.getItem('email') || '';
    this.allProducts = JSON.parse(localStorage.getItem('products') || '[]');
    if (this.email) this.getMyItems();
  }

  getMyItems() {
    this.api.getWishlist(this.email).subscribe(
      (result: any) => {
        this.cart = result.cart || [];
        this.products = [];

        // Normalize price fields
        this.allProducts.forEach((item: any) => {
          if (!item.normalPrice) item.normalPrice = item.price;
        });

        // Map backend cart with product info
        this.cart.forEach((cartItem: any) => {
          const product = this.allProducts.find((p: any) => p.id === cartItem.productId);
          if (product) {
            const pCopy = { ...product };
            pCopy.count = cartItem.count;
            pCopy.price = pCopy.normalPrice * cartItem.count;
            this.products.push(pCopy);
          }
        });

        // Compute total
        this.total = this.products.reduce((sum, p) => sum + p.price, 0);
        this.total = Number(this.total.toFixed(2));

        // Local storage sync
        localStorage.setItem('checkout', JSON.stringify(this.products));
        this.api.apiCart = this.cart.map((item) => item.productId);
        this.api.cartCount.next(this.api.apiCart);

        localStorage.setItem('username', result.username);
        localStorage.setItem('email', result.email);
        localStorage.setItem('wishlist', JSON.stringify(result.wishlist));
        localStorage.setItem('cart', JSON.stringify(result.cart));
        localStorage.setItem('token', result.token);
      },
      (err: any) => console.log(err.error?.message || err)
    );
  }

  onChange(value: any, productId: any) {
    const count = Number(value.target.value);
    this.api.updateCartItemCount(this.email, productId, count).subscribe(() => this.getMyItems());
  }

  removeFromCart(productId: any) {
    this.api.removeFromCart(this.email, productId).subscribe(() => this.getMyItems());
  }

  emptyCart() {
    this.api.emptyCart(this.email).subscribe(() => this.getMyItems());
  }
}
