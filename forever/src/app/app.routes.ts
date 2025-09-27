import { Routes } from '@angular/router';
import { LandingPage } from './landing-page/landing-page';
import { Products } from './website/products/products';
import { ProductDetail } from './website/product-detail/product-detail';
import { CartPage } from './website/cart-page/cart-page';
import { CheckoutPage } from './website/checkout-page/checkout-page';
import { OrderConfirmation } from './website/order-confirmation/order-confirmation';
import { AdminLogin } from './website/admin-login/admin-login';
import { AdminsPage } from './admin/admins-page/admins-page';
import { Messages } from './admin/messages/messages';
import { Orders } from './admin/orders/orders';
import { OrderDetail } from './admin/order-detail/order-detail';
import { Contacts } from './website/contacts/contacts';
import { AdminProducts } from './admin/products/products';
import { CreateProduct } from './admin/create-product/create-product';
import { ViewMessages } from './admin/view-messages/view-messages';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing_page',
    pathMatch: 'full',
  },
  {
    path: 'landing_page',
    component: LandingPage,
  },
  {
    path: 'products',
    component: Products,
  },
  {
    path: 'contacts',
    component: Contacts,
  },
  {
    path: 'productdetails/:id',
    component: ProductDetail,
  },
  {
    path: 'cart',
    component: CartPage,
  },
  {
    path: 'checkout',
    component: CheckoutPage,
  },
  {
    path: 'orderconfirmation',
    component: OrderConfirmation,
  },
  {
    path: 'login',
    component: AdminLogin,
  },
  {
    path: 'admins',
    component: AdminsPage,
    children: [
      {
        path: 'messages',
        component: Messages,
      },
      {
        path: 'orders',
        component: Orders,
      },
      {
        path: 'products',
        component: AdminProducts,
      },
      {
        path: 'orderdetails/:orderId',
        component: OrderDetail,
      },
      {
        path: 'createproduct',
        component: CreateProduct,
      },
      {
        path: 'viewmessage/:id', // Matches URL structure: /admins/viewmessage/2
        component: ViewMessages,
      },
    ],
  },
];
