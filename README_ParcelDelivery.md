
# 📦 Parcel Delivery System API

A secure, modular, and role-based backend system built using **Express.js**, **TypeScript**, and **MongoDB (Mongoose)**.

---

## 🚀 Project Overview

A fully-featured API system for managing parcel deliveries — inspired by **Pathao Courier** or **Sundarban Courier** — built with a clean modular architecture.

🔗 **Live Demo**: [Parcel Delivery System](https://parcel-delivery-backend-tau.vercel.app/)  
💻 **Repository**: [GitHub](https://github.com/DeveloperImran1/Parcel-Delivery-Backend)

---

## 🧱 Tech Stack

- **Backend**: Node.js, Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (Access + Refresh)
- **Authorization**: Role-based access (Admin, Sender, Receiver)
- **Validation**: Zod
- **Password Security**: Bcrypt
- **OTP & Email**: Nodemailer + Google App Password
- **Session & Tracking**: Redis, Express-Session

---

## 👥 User Roles

| Role      | Description |
|-----------|-------------|
| `Sender`  | Can create and cancel parcels |
| `Receiver`| Can view & confirm deliveries |
| `Admin`   | Manages users, parcels, and delivery status |

---

## 🗂️ Folder Structure

```
src/
├── modules/
│   ├── auth/
│   ├── user/
│   ├── parcel/
│   ├── otp/
├── middlewares/
├── config/
├── utils/
├── app.ts
├── server.ts
```

---

## ✅ Features

### 🔐 Auth & Security

- JWT-based authentication with role verification
- Forgot/reset password system
- OTP verification (email-based)
- Google OAuth login
- Express-session + Redis integration

### 📦 Parcel Management

- Sender creates & cancels parcel requests
- Receiver confirms delivery
- Admin updates parcel status (with status logs)
- Track status history

### 🧾 Status Logs

- Tracks all status updates (`Requested → Approved → Dispatched → In Transit → Delivered`)
- Includes timestamp, updatedBy, and optional notes

---

## 🔀 Parcel Flow

1. Sender creates a parcel → status: `Requested`
2. Admin approves → status: `Approved`
3. Admin dispatches → status: `Dispatched`
4. Admin marks `In Transit` → status updated
5. Receiver confirms delivery → status: `Delivered`

---

## 🔐 Role-Based Access

- **Sender**: Create, cancel, and track parcels they created
- **Receiver**: View assigned parcels and mark as delivered
- **Admin**: Full access – view, block, update users and parcels

---

## 🌐 API Endpoints

### 🧾 Auth

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/refresh-token`
- `POST /api/v1/auth/set-password`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/auth/change-password`

### 🔑 OTP

- `POST /api/v1/otp/send`
- `POST /api/v1/otp/verify`

### 👤 User

- `POST /api/v1/user/register`
- `GET /api/v1/user/me`
- `PATCH /api/v1/user/:id`
- `GET /api/v1/user/all-users` (admin)

### 📦 Parcel

- `POST /api/v1/parcel/create-parcel`
- `GET /api/v1/parcel/all-parcel`
- `GET /api/v1/parcel/my-parcel`
- `GET /api/v1/parcel/:id`
- `PATCH /api/v1/parcel/:id` (update/cancel)

---

## 🧪 Validation & Rules

- 🚫 Senders cannot cancel a dispatched parcel
- ✅ Receivers can only mark delivered after `In Transit`
- ✅ Admins can block/unblock parcels or users
- ❌ Wrong status flow (e.g., Delivered → Requested) is restricted

---

## 🛠 Setup & Installation

### 1. Clone & Install

```bash
git clone https://github.com/DeveloperImran1/Parcel-Delivery-Backend
cd Parcel-Delivery-Backend
npm install
```

### 2. Create `.env` File

```bash
PORT=5000
DB_URL=your_mongodb_url
JWT_ACCESS_SECRET=access_secret
JWT_REFRESH_SECRET=refresh_secret
...
```

### 3. Run the App

```bash
npm run dev      # Development mode
npm run build    # Compile TypeScript
npm run start    # Run compiled app
```

---

## 📬 Sample Request

```http
POST /api/v1/parcel/create-parcel
Authorization: Bearer <token>

{
  "sender": "userId1",
  "receiver": "userId2",
  "weight": 2.5,
  "pickupAddress": "Dhaka",
  "deliveryAddress": "Chittagong",
  "deliveryDate": "2025-08-05",
  "type": "regular",
  "fee": 150,
  "couponCode": "NEW50"
}
```

---

## 👨‍💻 Developer

Developed by **Md Imran** 🔗 [@DeveloperImran1](https://github.com/DeveloperImran1)

---

## 📝 License

MIT License
