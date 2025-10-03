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
  products: any[] = [];           // All products
  filteredProducts: any[] = [];   // Filtered products (for search)
  email: string = '';
  wishlistMsg: string = '';
  wishlist: number[] = [];
  cart: number[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.email = localStorage.getItem('email') || '';

    // Fetch all products for displaying cards
    this.api.getAllProducts().subscribe((res: any) => {
      this.products = res;
      this.filteredProducts = res; // initially show all products
    });

    // Subscribe to search term from header
    this.api.searchKey.subscribe((term: string) => {
      if (!term) {
        this.filteredProducts = this.products;
      } else {
        this.filteredProducts = this.products.filter(p =>
          p.name.toLowerCase().includes(term.toLowerCase())
        );
      }
    });

    // Fetch wishlist/cart info if user logged in
    if (this.email) {
      this.getMyItems();
    }

    // Fetch single product if route has productId
    this.activatedRoute.params.subscribe((params: any) => {
      this.productId = params['id'];
      if (this.productId) {
        this.api.viewProduct(this.productId).subscribe((result: any) => {
          this.product = result.product;
        });
      }
    });
  }

  addToWishlist(productId: any) {
    if (!this.email) return alert('Login to add to wishlist!');
    this.api.addToWishlist(this.email, productId).subscribe(
      (result: any) => {
        this.wishlistMsg = result.message;
        this.getMyItems();
        setTimeout(() => (this.wishlistMsg = ''), 5000);
      },
      (result: any) => (this.wishlistMsg = result.error.message)
    );
  }

  removeFromWishlist(productId: any) {
    this.api.removeFromWishlist(this.email, productId).subscribe(
      (result: any) => {
        this.wishlistMsg = result.message;
        const index = this.wishlist.indexOf(productId);
        if (index > -1) this.wishlist.splice(index, 1);
        this.getMyItems();
        setTimeout(() => (this.wishlistMsg = ''), 5000);
      },
      (result: any) => (this.wishlistMsg = result.error.message)
    );
  }

  addToCart(productId: any) {
    if (!this.email) return alert('Login to add to cart!');
    this.api.addToCart(this.email, productId, 1).subscribe(
      (result: any) => {
        this.wishlistMsg = result.message;
        this.getMyItems();
        setTimeout(() => (this.wishlistMsg = ''), 5000);
      },
      (result: any) => (this.wishlistMsg = result.error.message)
    );
  }

  removeFromCart(productId: any) {
    this.api.removeFromCart(this.email, productId).subscribe(
      (result: any) => {
        this.wishlistMsg = result.message;
        const index = this.cart.indexOf(productId);
        if (index > -1) this.cart.splice(index, 1);
        this.getMyItems();
        setTimeout(() => (this.wishlistMsg = ''), 5000);
      },
      (result: any) => (this.wishlistMsg = result.error.message)
    );
  }

  getMyItems() {
    this.api.getWishlist(this.email).subscribe(
      (result: any) => {
        // Update cart array
        this.cart = result.cart.map((item: any) => item.productId);
        this.api.apiCart = [...this.cart];
        this.api.cartCount.next(this.cart);

        // Update wishlist array
        this.wishlist = result.wishlist.map((item: any) => item.productId);
        this.api.apiWishlist = [...this.wishlist];

        // Update localStorage
        localStorage.setItem('username', result.username);
        localStorage.setItem('email', result.email);
        localStorage.setItem('wishlist', JSON.stringify(result.wishlist));
        localStorage.setItem('cart', JSON.stringify(result.cart));
        localStorage.setItem('token', result.token);
      },
      (err: any) => console.log(err.error.message)
    );
  }
}
