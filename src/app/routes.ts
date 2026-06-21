import { createBrowserRouter } from "react-router";
import { createElement } from "react";
import { Layout } from "./components/layout";
import { Dashboard } from "./components/dashboard";
import { LoginPage } from "./components/login";
import { RegisterPage } from "./components/register";
import { ProtectedRoute, PublicOnlyRoute } from "./auth/protected-route";
import { NotFoundPage } from "./components/not-found";

const lazyFrom = <T extends Record<string, any>>(
  loader: () => Promise<T>,
  key: keyof T,
) => async () => {
  const mod = await loader();
  return { Component: mod[key] };
};

const wallet = () => import("./components/wallet-pages");
const payment = () => import("./components/payment-pages");
const receive = () => import("./components/receive-pages");
const transaction = () => import("./components/transaction-pages");
const order = () => import("./components/order-pages");
const document_ = () => import("./components/document-pages");
const statement = () => import("./components/statement-pages");
const shop = () => import("./components/shop-pages");
const finance = () => import("./components/finance-pages");
const settings = () => import("./components/settings-pages");
const qr = () => import("./components/qr-pages");

const prefetchers: Record<string, () => Promise<unknown>> = {
  "/wallet": wallet, "/wallet/recharge": wallet, "/wallet/withdraw": wallet,
  "/pay": payment, "/pay/order": payment, "/pay/mission": payment, "/pay/cotisations": payment, "/pay/bills": payment,
  "/qr": qr, "/qr/scan": qr, "/qr/receive": qr, "/qr/history": qr,
  "/receive": receive, "/receive/requests": receive,
  "/transactions": transaction,
  "/orders": order,
  "/documents": document_, "/documents/generate": document_,
  "/statements": statement, "/statements/summary": statement,
  "/shop": shop, "/shop/reviews": shop,
  "/vouchers": finance, "/credit": finance, "/credit/request": finance,
  "/savings": finance, "/savings/deposit": finance, "/savings/withdraw": finance,
  "/gains": finance, "/investments": finance,
  "/accounting": settings, "/profile": settings, "/profile/edit": settings,
  "/settings": settings, "/integrations": settings, "/support": settings, "/support/disputes": settings,
};

const prefetched = new Set<string>();
export function prefetchRoute(path: string) {
  const loader = prefetchers[path];
  if (!loader || prefetched.has(path)) return;
  prefetched.add(path);
  loader().catch(() => prefetched.delete(path));
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: createElement(PublicOnlyRoute, null, createElement(LoginPage)),
  },
  {
    path: "/register",
    element: createElement(PublicOnlyRoute, null, createElement(RegisterPage)),
  },
  {
    path: "/",
    element: createElement(ProtectedRoute, null, createElement(Layout)),
    children: [
      { index: true, Component: Dashboard },
      // Wallet
      { path: "wallet", lazy: lazyFrom(wallet, "WalletPage") },
      { path: "wallet/recharge", lazy: lazyFrom(wallet, "RechargePage") },
      { path: "wallet/withdraw", lazy: lazyFrom(wallet, "WithdrawPage") },
      // Pay
      { path: "pay", lazy: lazyFrom(payment, "PayPage") },
      { path: "pay/order", lazy: lazyFrom(payment, "PayOrderPage") },
      { path: "pay/mission", lazy: lazyFrom(payment, "PayMissionPage") },
      { path: "pay/cotisations", lazy: lazyFrom(payment, "PayCotisationsPage") },
      { path: "pay/bills", lazy: lazyFrom(payment, "PayBillsPage") },
      // QR Code
      { path: "qr", lazy: lazyFrom(qr, "QRHubPage") },
      { path: "qr/scan", lazy: lazyFrom(qr, "QRScanPage") },
      { path: "qr/receive", lazy: lazyFrom(qr, "QRReceivePage") },
      { path: "qr/history", lazy: lazyFrom(qr, "QRHistoryPage") },
      // Receive
      { path: "receive", lazy: lazyFrom(receive, "ReceivePage") },
      { path: "receive/requests", lazy: lazyFrom(receive, "PaymentRequestsPage") },
      // Transactions
      { path: "transactions", lazy: lazyFrom(transaction, "TransactionsPage") },
      { path: "transactions/:id", lazy: lazyFrom(transaction, "TransactionDetailPage") },
      { path: "transactions/confirm-payment", lazy: lazyFrom(transaction, "PaymentConfirmationPage") },
      { path: "transactions/confirm-transaction", lazy: lazyFrom(transaction, "TransactionConfirmationPage") },
      // Orders
      { path: "orders", lazy: lazyFrom(order, "OrdersPage") },
      { path: "orders/:id", lazy: lazyFrom(order, "OrderDetailPage") },
      // Documents
      { path: "documents", lazy: lazyFrom(document_, "DocumentsPage") },
      { path: "documents/generate", lazy: lazyFrom(document_, "InvoiceGeneratorPage") },
      // Statements
      { path: "statements", lazy: lazyFrom(statement, "StatementsPage") },
      { path: "statements/summary", lazy: lazyFrom(statement, "SummaryStatesPage") },
      // Shop
      { path: "shop", lazy: lazyFrom(shop, "ShopInventoryPage") },
      { path: "shop/:id", lazy: lazyFrom(shop, "ProductDetailPage") },
      { path: "shop/reviews", lazy: lazyFrom(shop, "ReviewsPage") },
      // Vouchers
      { path: "vouchers", lazy: lazyFrom(finance, "VouchersPage") },
      // Credit
      { path: "credit", lazy: lazyFrom(finance, "CreditPage") },
      { path: "credit/request", lazy: lazyFrom(finance, "CreditRequestPage") },
      { path: "credit/:id", lazy: lazyFrom(finance, "CreditDetailPage") },
      // Savings
      { path: "savings", lazy: lazyFrom(finance, "SavingsPage") },
      { path: "savings/deposit", lazy: lazyFrom(finance, "SavingsDepositPage") },
      { path: "savings/withdraw", lazy: lazyFrom(finance, "SavingsDepositPage") },
      // Gains
      { path: "gains", lazy: lazyFrom(finance, "GainsPage") },
      // Investments
      { path: "investments", lazy: lazyFrom(finance, "InvestmentsPage") },
      { path: "investments/:id", lazy: lazyFrom(finance, "InvestmentDetailPage") },
      // Accounting
      { path: "accounting", lazy: lazyFrom(settings, "AccountingPage") },
      // Profile & Settings
      { path: "profile", lazy: lazyFrom(settings, "ProfilePage") },
      { path: "profile/edit", lazy: lazyFrom(settings, "EditProfilePage") },
      { path: "settings", lazy: lazyFrom(settings, "SettingsPage") },
      // Integrations
      { path: "integrations", lazy: lazyFrom(settings, "IntegrationsPage") },
      // Support
      { path: "support", lazy: lazyFrom(settings, "SupportPage") },
      { path: "support/disputes", lazy: lazyFrom(settings, "DisputesPage") },
    ],
  },
  {
    path: "*",
    Component: NotFoundPage,
  },
]);
