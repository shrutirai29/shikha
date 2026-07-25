# Database Design Document

# Cozy Crochet - Handmade Crochet E-Commerce Website

**Version:** 1.0
**Author:** Shruti
**Database:** MongoDB Atlas
**Backend:** Node.js + Express.js + TypeScript
**Frontend:** Next.js + TypeScript + Tailwind CSS
**Storage:** Cloudinary
**Payment Gateway:** Razorpay (Primary), Stripe (Future)

---

# 1. Project Overview

## Project Description

Cozy Crochet is a premium handmade crochet products e-commerce platform where every product, category, banner, offer, and website content is managed entirely through an Admin Dashboard.

Customers can browse products, search collections, place orders, make secure payments, track deliveries, save wishlists, review products, and manage their profiles.

The platform is designed with scalability, security, and maintainability in mind.

---

# 2. Objectives

* Sell handmade crochet products online.
* Allow the admin to manage every aspect of the website.
* Provide a secure shopping experience.
* Build a responsive and animated user interface.
* Maintain a scalable backend architecture.
* Store all data securely in MongoDB Atlas.

---

# 3. User Roles

## Administrator

Responsible for managing the complete website.

### Permissions

* Login securely
* Manage Products
* Manage Categories
* Manage Inventory
* Manage Orders
* Manage Customers
* Manage Reviews
* Manage Coupons
* Manage Banners
* Manage Website Settings
* Manage Analytics
* View Payment Records
* Manage Notifications
* Manage Homepage
* Manage FAQs
* Manage Blogs

---

## Customer

Can

* Register
* Login
* Browse Products
* Search Products
* Filter Products
* View Product Details
* Add to Cart
* Add to Wishlist
* Checkout
* Make Payments
* Track Orders
* Write Reviews
* Manage Profile
* View Order History

---

# 4. Functional Requirements

## Admin Module

* Secure Login
* Dashboard
* Product CRUD
* Category CRUD
* Inventory Management
* Order Management
* Customer Management
* Coupon Management
* Banner Management
* Website Content Management
* Payment Monitoring
* Analytics Dashboard
* Notification Management

---

## Customer Module

* Registration
* Authentication
* Product Browsing
* Product Search
* Product Filters
* Cart
* Wishlist
* Checkout
* Razorpay Payment
* Order Tracking
* Reviews
* Profile Management

---

# 5. Non Functional Requirements

* Fast loading time
* Responsive Design
* Secure Authentication
* Password Hashing
* JWT Authentication
* HTTPS
* Image Optimization
* SEO Friendly
* Accessibility Support
* Database Backup
* Activity Logging
* Error Logging
* Scalable Architecture
* Mobile Friendly

---

# 6. Technology Stack

## Frontend

* Next.js
* TypeScript
* Tailwind CSS
* Framer Motion
* ShadCN UI
* Axios
* TanStack Query

## Backend

* Node.js
* Express.js
* TypeScript

## Database

MongoDB Atlas

## Authentication

* JWT
* Refresh Tokens
* HTTP Only Cookies

## Storage

Cloudinary

## Payment

Razorpay

## Deployment

Frontend → Vercel

Backend → Render

Database → MongoDB Atlas

Storage → Cloudinary

---

# 7. Database Collections

1. Admin
2. Users
3. Products
4. Categories
5. Inventory
6. Orders
7. Payments
8. Reviews
9. Wishlist
10. Cart
11. Coupons
12. Notifications
13. Website Settings
14. Activity Logs
15. Banners
16. Blogs
17. FAQs
18. Shipping Methods
19. Contact Messages
20. Newsletter Subscribers

---

# 8. Collection Design

---

# Admin

```
_id

name

email

password

role

permissions

twoFactorEnabled

lastLogin

profileImage

status

createdAt

updatedAt
```

---

# Users

```
_id

name

email

phone

password

avatar

addresses

wishlist

cart

orders

role

isVerified

status

createdAt

updatedAt
```

---

# Products

```
_id

title

slug

shortDescription

description

category

subCategory

price

salePrice

discount

stock

SKU

barcode

material

color

dimensions

weight

images

videos

tags

careInstructions

rating

reviewCount

featured

trending

active

SEO

createdAt

updatedAt
```

---

# Categories

```
_id

name

slug

description

image

parentCategory

displayOrder

active

createdAt

updatedAt
```

---

# Inventory

```
_id

productId

availableStock

reservedStock

damagedStock

incomingStock

minimumStock

supplier

warehouse

lastUpdated
```

---

# Orders

```
_id

orderNumber

userId

products

shippingAddress

billingAddress

subtotal

shippingCharge

discount

tax

totalAmount

paymentId

status

trackingNumber

estimatedDelivery

notes

createdAt

updatedAt
```

---

# Payments

```
_id

orderId

gateway

paymentId

transactionId

amount

currency

status

refundStatus

paymentMethod

paidAt

createdAt
```

---

# Reviews

```
_id

userId

productId

rating

title

review

images

approved

createdAt
```

---

# Wishlist

```
_id

userId

products

updatedAt
```

---

# Cart

```
_id

userId

items

subtotal

discount

shipping

tax

total

updatedAt
```

---

# Coupons

```
_id

code

type

discount

minimumPurchase

maximumDiscount

expiryDate

usageLimit

usedCount

status

createdAt
```

---

# Notifications

```
_id

title

message

type

receiver

status

createdAt
```

---

# Website Settings

```
_id

siteName

logo

favicon

heroBanner

announcementBar

currency

taxRate

shippingCharge

socialLinks

contactDetails

maintenanceMode

updatedAt
```

---

# Activity Logs

```
_id

adminId

action

module

ipAddress

device

browser

changes

createdAt
```

---

# Banners

```
_id

title

image

buttonText

buttonLink

displayOrder

active

startDate

endDate
```

---

# Blogs

```
_id

title

slug

thumbnail

content

author

tags

published

createdAt
```

---

# FAQs

```
_id

question

answer

displayOrder

active
```

---

# Shipping Methods

```
_id

name

price

estimatedDays

active
```

---

# Contact Messages

```
_id

name

email

phone

subject

message

status

createdAt
```

---

# Newsletter Subscribers

```
_id

email

subscribedAt

status
```

---

# 9. Database Relationships

```
Users
│
├── Orders
│     │
│     └── Payments
│
├── Wishlist
│
├── Cart
│
└── Reviews


Categories
│
└── Products
      │
      ├── Inventory
      └── Reviews


Products
│
├── Orders
├── Wishlist
└── Cart


Admin
│
├── Products
├── Categories
├── Coupons
├── Orders
├── Website Settings
├── Banners
└── Activity Logs
```

---

# 10. User Flow

```
Landing Page

↓

Collections

↓

Product Details

↓

Add to Cart

↓

Checkout

↓

Payment

↓

Order Confirmation

↓

Track Order
```

---

# 11. Admin Flow

```
Admin Login

↓

Dashboard

↓

Products

↓

Categories

↓

Inventory

↓

Orders

↓

Customers

↓

Coupons

↓

Payments

↓

Analytics

↓

Website Settings
```

---

# 12. Future Features

* Gift Wrapping
* Personalized Gift Notes
* Loyalty Program
* Referral Rewards
* AI Product Recommendations
* Multi-language Support
* Multi-currency Support
* Gift Cards
* Live Chat Support
* Push Notifications
* Mobile App
* Seller Marketplace
* Subscription Boxes
* Recently Viewed Products
* Back-in-Stock Alerts

---

# 13. Security Features

* JWT Authentication
* Refresh Tokens
* HTTP Only Cookies
* Password Hashing (bcrypt)
* Rate Limiting
* Helmet Security
* CORS Protection
* Input Validation
* MongoDB Injection Protection
* XSS Protection
* CSRF Protection
* Role-Based Access Control (RBAC)
* Audit Logs
* Secure File Upload Validation

---

# 14. Deployment Architecture

```
Users
   │
   ▼
Frontend (Next.js on Vercel)

   │

HTTPS

   │

Backend (Node.js + Express on Render)

   │

MongoDB Atlas

   │

Cloudinary

   │

Razorpay
```

---

# 15. Development Roadmap

## Phase 1 – Planning

* Database Design
* UI Design
* API Design
* Folder Structure

## Phase 2 – Backend

* Project Setup
* MongoDB Connection
* Authentication
* Models
* APIs
* Security

## Phase 3 – Admin Dashboard

* Login
* Dashboard
* Product Management
* Category Management
* Inventory
* Orders
* Customers
* Coupons
* Website Settings

## Phase 4 – Customer Website

* Homepage
* Shop
* Product Details
* Wishlist
* Cart
* Checkout

## Phase 5 – Payments

* Razorpay Integration
* Order Confirmation
* Invoice Generation

## Phase 6 – Deployment

* Deploy Backend
* Deploy Frontend
* Connect MongoDB Atlas
* Configure Cloudinary
* Configure Razorpay
* Configure Domain
* SSL
* Testing
* Production Launch

---

# 16. Project Status

* [x] Planning
* [ ] Backend Setup
* [ ] MongoDB Connection
* [ ] Authentication
* [ ] Admin Dashboard
* [ ] Product Module
* [ ] Category Module
* [ ] Inventory Module
* [ ] Customer Website
* [ ] Cart
* [ ] Checkout
* [ ] Payment Gateway
* [ ] Deployment
* [ ] Production Ready
