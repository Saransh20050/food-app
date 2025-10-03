import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

const options = {
  headers: new HttpHeaders(),
};

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  // Search key shared between header and home/view components
  searchKey = new BehaviorSubject('');
  
  // Messages and local cache
  wishlistMsg: string = '';
  apiWishlist: number[] = [];
  apiCart: number[] = [];
  products: any[] = [];
  cartCount = new BehaviorSubject<number[]>([]);

  constructor(private http: HttpClient) {}

  // ------------------ Auth ------------------
  register(username: string, email: string, password: string) {
    return this.http.post('http://localhost:3000/register', {
      username,
      email,
      password,
    });
  }

  login(email: string, password: string) {
    return this.http.post('http://localhost:3000/login', { email, password });
  }

  // ------------------ Products ------------------
  getAllProducts() {
    return this.http.get('http://localhost:3000/all-products');
  }

  viewProduct(productId: any) {
    return this.http.get('http://localhost:3000/view-product/' + productId);
  }

  // ------------------ Auth Header ------------------
  appendToken() {
    const token = localStorage.getItem('token') || '';
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.append('access-token', token);
      options.headers = headers;
    }
    return options;
  }

  // ------------------ Wishlist ------------------
  addToWishlist(email: string, productId: number) {
    return this.http.post(
      'http://localhost:3000/addToWishlist/',
      { email, productId },
      this.appendToken()
    );
  }

  removeFromWishlist(email: string, productId: number) {
    return this.http.put(
      'http://localhost:3000/removeFromWishlist/',
      { email, productId },
      this.appendToken()
    );
  }

  getWishlist(email: string) {
    return this.http.get(
      'http://localhost:3000/getWishlist/' + email,
      this.appendToken()
    );
  }

  // ------------------ Cart ------------------
  addToCart(email: string, productId: number, count: number) {
    return this.http.post(
      'http://localhost:3000/addToCart/',
      { email, productId, count },
      this.appendToken()
    );
  }

  updateCartItemCount(email: string, productId: number, count: number) {
    return this.http.put(
      'http://localhost:3000/updateCartItemCount/',
      { email, productId, count },
      this.appendToken()
    );
  }

  removeFromCart(email: string, productId: number) {
    return this.http.put(
      'http://localhost:3000/removeFromCart/',
      { email, productId },
      this.appendToken()
    );
  }

  emptyCart(email: string) {
    return this.http.put(
      'http://localhost:3000/emptyCart/',
      { email },
      this.appendToken()
    );
  }

  // ------------------ Checkout ------------------
  addToCheckout(
    email: string,
    orderID: string,
    transactionID: string,
    dateAndTime: string,
    amount: number,
    status: string,
    products: any[],
    detailes: any
  ) {
    return this.http.post(
      'http://localhost:3000/addToCheckout/',
      {
        email,
        orderID,
        transactionID,
        dateAndTime,
        amount,
        status,
        products,
        detailes,
      },
      this.appendToken()
    );
  }

  // ------------------ Orders ------------------
  getMyOrders(email: string) {
    return this.http.get(
      'http://localhost:3000/getMyOrders/' + email,
      this.appendToken()
    );
  }
}
