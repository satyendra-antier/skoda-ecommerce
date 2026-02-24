# ŠKODA Lifestyle — E-Commerce Integration · One-Page Report

**Phase 1 · Version 1.0 · Confidential**

---

## What We Need to Build

| Area | Scope |
|------|--------|
| **Front-end** | Product listing (grid, image, name, price, stock status), product detail (gallery, specs, quantity, Add to Cart), cart (summary, quantity controls, totals, checkout CTA), checkout (Full Name, Mobile, Email, Shipping Address, City, State, Pincode — with validation). Design reference: [Porsche Shop](https://shop.porsche.com/us/en-US). |
| **Payments** | BillDesk integration (server-side): unique Order ID, secure hash (server-only), redirect to BillDesk hosted page, callback handling, response validation, order status update. No card/sensitive data stored. Test + Production. |
| **Inventory** | Centralised model: Product ID, SKU, Price, Available Stock, Status (Active/Out of Stock). Deduct stock only after successful payment; oversell protection; out-of-stock = no Add to Cart, no checkout. |
| **CRM** | Zoho: auto-create/update order on successful payment. Fields: Customer Name, Mobile, Email, Shipping Address, Products, Quantity, Order ID, Amount Paid, Payment Status, Order Date/Time. Deduplication, error logging, optional retry. |
| **Admin** | Web dashboard: view/filter orders, update stock, override status, CSV export, payment status summary. |
| **Security** | Hash server-side only; credentials in env; SSL on payment pages; audit logs for order/payment; no card storage. |

---

## End-to-End Flow

```
Product listing → Product detail → Add to Cart → Cart → Checkout (customer + address)
       → Stock check → BillDesk redirect → Payment (hosted) → Callback
       → Validate response → Update order status → Deduct inventory
       → Create/update Zoho order → Confirmation to customer
```

- **Payment statuses:** Pending → Successful / Failed (order and UI updated accordingly).
- **Out-of-stock:** Product hidden/disabled for Add to Cart; checkout blocked if stock depletes between cart and payment.

---

## Assumptions

- Client is already onboarded with BillDesk; Test and Production credentials will be provided.
- Single centralised inventory (no dealer/multi-warehouse in Phase 1).
- Zoho module name, field mapping, and API credentials will be provided at kick-off.
- Design and UX will follow Porsche Shop as reference; no separate design phase specified.
- Retry for failed Zoho sync is “if feasible within scope.”
- Server environment, deployment access, SSL, and domain are client-provided.

---

## Out of Scope (Phase 1)

Dealer-level inventory · ERP integration · Multi-warehouse · Automated refunds · Advanced discount/coupon engine.

---

## Client Inputs Required at Kick-off

| From | Items |
|------|--------|
| **BillDesk** | Merchant ID, Secret Key, Test credentials, Integration docs, Approved callback URL |
| **Zoho** | API credentials, Order module name, Field mapping sheet |
| **IT** | Server env details, Deployment access, SSL confirmation, Domain details |

---

## Deliverables

Functional e-commerce journey · BillDesk (Test & Prod) · Zoho CRM integration · Inventory module · Admin dashboard · UAT & go-live support · Basic technical documentation.

---

*ŠKODA AUTO India · ŠKODA Lifestyle E-Commerce Integration · Phase 1 SOW*
