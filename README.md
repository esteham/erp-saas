# 🧭 Hyper Local Service Provider Network with Dynamic Pricing

A full-stack web application where users can request nearby service providers (e.g., electricians, plumbers) and get dynamically calculated pricing based on real-time factors like time, zone, demand, and provider availability.

---

## 🚀 Features

### 👤 Users
- Register/Login
- Request local services
- View dynamic pricing
- Track service status & history

### 🛠️ Service Providers
- Register/Login
- Set availability
- Accept/reject service requests
- View earnings

### 🛡️ Admin
- Manage users & providers
- Set zone-based pricing rules
- Control demand-supply multipliers
- Assign zones & areas

---

## 📦 Tech Stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| Frontend     | React (Vite), React Router, Axios |
| Backend      | PHP (OOP), PDO, REST API          |
| Database     | MySQL                             |
| Styling      | Bootstrap                         |
| Auth         | Session/JWT (configurable)        |

---

## 📁 Project Structure

hyperlocal-service-network/
├── backend/
│ ├── api/ # All RESTful PHP endpoints
│ ├── classes/ # PHP OOP class files
│ ├── config/ # DB config and initialization
│ └── assets/ # Uploads and static files
│
├── frontend/
│ ├── public/ # HTML template
│ ├── src/
│ │ ├── components/ # React components (User, Admin, Provider)
│ │ ├── pages/ # Page-level components
│ │ ├── context/ # Context API (e.g., AuthContext)
│ │ ├── services/ # Axios API wrappers
│ │ └── App.jsx # Main App
│ └── .env # Environment variables
│
├── database/
│ └── schema.sql # All MySQL tables


---

## ⚙️ Setup Instructions

### 🐘 Backend (PHP)
1. Install PHP & MySQL
2. Create a database and import `database/schema.sql`
3. Set up Apache or PHP built-in server
4. Configure `/backend/config/database.php` with your DB credentials

### ⚛️ Frontend (React)
1. Navigate to `frontend/`
2. Install dependencies:
   ```bash
   npm install

    Start development server:

    npm run dev

📊 Database Overview

    users – User info (role: user/admin/provider)

    providers – Skills, availability, and zone

    services – User-to-provider job mapping

    pricing_rules – Zone/time/multiplier rules

    zones and areas – Geo data

    reviews, notifications

💡 Dynamic Pricing Algorithm

Dynamic pricing is calculated based on:

    Current time of day (peak/off-peak)

    Zone-specific multipliers

    Provider availability (low/high)

    User demand volume

Example formula:

final_price = base_price * zone_multiplier * time_multiplier * demand_factor

🔐 Security

    Passwords hashed using password_hash()

    Backend uses PDO prepared statements

    Session-based login with role checking

    Frontend input validation with alerts

📜 License

This project is licensed under the MIT License.
👨‍💻 Author

Developed by Esteham H. Zihad Ansari
For any queries, email: spider@xetroot.com
