// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs'; 
import { delay } from 'rxjs/operators'; 

const options = {
  headers: new HttpHeaders(),
};

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  // Shared search key (header -> home/view)
  searchKey = new BehaviorSubject<string>('');

  // caches + messages
  wishlistMsg: string = '';
  apiWishlist: number[] = [];
  apiCart: number[] = [];
  products: any[] = [];
  cartCount = new BehaviorSubject<number[]>([]);

  // >>> NEW: FAKE REALTIME COUNTER (for header) <<<
  private totalProductsSource = new BehaviorSubject<number>(100); 
  totalProducts$ = this.totalProductsSource.asObservable(); 
  // >>> END NEW VARIABLE <<<

  constructor(private http: HttpClient) {
    // Start the fake real-time updates when the service loads
    this.startFakeRealtimeUpdates(); 
  }

  // >>> FAKE REMOTE CONFIG METHOD (EXISTING) <<<
  /**
   * Simulates fetching a parameter value from a backend service (e.g., Remote Config).
   */
  getBannerMessage(key: string): Observable<string> {
    const fakeMessage = '🎉🎉 WELCOME TO YOUR WISHLIST 🎉🎉!!!';
    
    return of(fakeMessage).pipe(
      delay(300) 
    );
  }
  // >>> END FAKE REMOTE CONFIG METHOD <<<

  // >>> NEW: FAKE REALTIME METHOD <<<
  /**
   * Simulates a background listener that updates a counter every few seconds.
   */
  startFakeRealtimeUpdates() {
    let currentCount = 100; // Start value
    
    // Use setInterval to periodically update the BehaviorSubject
    setInterval(() => {
        // Simple logic: go down, then reset to a high number
        if (currentCount > 90) {
            currentCount--;
        } else {
            currentCount = 105; // Simulate restocking
        }
        // Push the new value to all subscribers (HeaderComponent will pick this up)
        this.totalProductsSource.next(currentCount); 
    }, 5000); // Updates every 5 seconds
  }
  // >>> END NEW REALTIME METHOD <<<

  // >>> NEW: FAKE ASYNC FUNCTION METHOD (for checkout) <<<
  /**
   * Simulates a complex, time-consuming cloud function or API call 
   * for a feature like processing an order or sending an email.
   */
  fakeProcessOrder(orderData: any): Observable<any> {
      const fakeResponse = {
          success: true,
          message: 'Order successfully processed by simulated Cloud Function.',
          transactionId: 'TXN-' + Math.floor(Math.random() * 1000000)
      };
      
      // Simulate a longer processing delay (e.g., 2 seconds)
      return of(fakeResponse).pipe(
          delay(2000) 
      );
  }
  // >>> END NEW ASYNC FUNCTION METHOD <<<


  // auth
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

  // products
  getAllProducts() {
    return this.http.get('http://localhost:3000/all-products');
  }

  viewProduct(productId: any) {
    return this.http.get('http://localhost:3000/view-product/' + productId);
  }

  // server-side search (optional)
  searchProducts(key: string) {
    return this.http.get('http://localhost:3000/search/' + encodeURIComponent(key));
  }

  // token header
  appendToken() {
    const token = localStorage.getItem('token') || '';
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.append('access-token', token);
      options.headers = headers;
    }
    return options;
  }

  // wishlist
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
    return this.http.get('http://localhost:3000/getWishlist/' + email, this.appendToken());
  }

  // cart
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

  // checkout
  addToCheckout(
    email: string,
    orderID: string,
    transactionID: string,
    dateAndTime: string,
    amount: number,
    status: string,
    products: any[],
    details: any
  ) {
    return this.http.post(
      'http://localhost:3000/addToCheckout/',
      { email, orderID, transactionID, dateAndTime, amount, status, products, details },
      this.appendToken()
    );
  }

  // orders
  getMyOrders(email: string) {
    return this.http.get('http://localhost:3000/getMyOrders/' + email, this.appendToken());
  }
}