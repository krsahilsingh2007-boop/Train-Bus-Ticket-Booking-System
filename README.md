# RailBus | Online Railway & Bus Ticket Booking System
### Full-Stack MERN + Selenium WebDriver + Apache JMeter

An enterprise-grade, concurrency-safe transportation booking platform built with **React 19**, **Node.js**, **Express**, and **MongoDB**, backed by automated **Selenium WebDriver TestNG** test suites and **Apache JMeter** performance plans.

---

## 1. Mandatory 4-Color Visual Design System

The application strictly implements the required four-color palette with a consistent **Light Theme** hierarchy:

| Token | Hex Code | Usage Ratio | Application in UI |
| :--- | :--- | :--- | :--- |
| **Light Cream** | `#FBF0E6` | ~45% | Dominant website background, base canvas, form input backgrounds |
| **Soft Peach** | `#F7E1C9` | ~25% | Secondary background, search cards, highlighted cards, footer |
| **Medium Teal** | `#65AFB0` | ~20% | Interactive accents, secondary buttons, icons, borders, active tabs |
| **Deep Teal** | `#407778` | ~10% | Navbar, primary CTA buttons, typography headings, focal actions |

---

## 2. Project Architecture & Directory Structure

```
Online-Ticket-Booking-System/
│
├── frontend/                     # React 19 + Vite 8 Client Application
│   ├── src/
│   │   ├── components/           # Reusable UI widgets & modals
│   │   ├── pages/                # Route views (HomePage, Trains, Buses, Bookings, etc.)
│   │   ├── layouts/              # Navbar and Footer following strict color palette
│   │   ├── services/             # Axios API client with JWT interceptors
│   │   ├── hooks/                # Custom React state hooks
│   │   ├── context/              # Global AuthContext & state providers
│   │   └── assets/               # Brand assets and SVG iconography
│   ├── package.json              # Client dependencies
│   ├── vite.config.js            # Vite configuration with @tailwindcss/vite
│   └── index.html                # Entry point with Google Fonts (Plus Jakarta Sans)
│
├── backend/                      # Node.js + Express REST API Server
│   ├── config/                   # Database connector (MongoDB + MemoryServer fallback)
│   ├── controllers/              # Business logic handlers
│   ├── models/                   # 9 Mongoose schemas (User, Train, Bus, Route, Schedule, SeatInventory, Booking, Payment, Cancellation)
│   ├── routes/                   # REST API routes
│   ├── middleware/               # JWT Auth, Role Guard, Rate Limiter, Error Handler
│   ├── services/                 # Fare calculation, PDF generation & seat locking
│   ├── utils/                    # Data seeders & helper utilities
│   ├── server.js                 # Express server application entry point
│   ├── package.json              # Server dependencies
│   └── .env                      # Environment configuration
│
├── selenium-tests/               # Java Maven Automation Testing Framework
│   ├── src/test/java/
│   │   └── com/ticketbooking/
│   │       ├── pages/            # Page Object Model (POM) classes
│   │       ├── tests/            # TestNG test scenarios (19 test cases)
│   │       └── utils/            # WebDriver lifecycle & screenshot listener
│   ├── pom.xml                   # Maven POM with Selenium 4, TestNG, WebDriverManager
│   └── testng.xml                # TestNG execution suite runner
│
├── jmeter-tests/                 # Apache JMeter Performance Testing
│   ├── load-test.jmx             # 50-user concurrent load test plan
│   ├── stress-test.jmx           # 200-user spike & stress test plan
│   └── reports/                  # JMeter HTML dashboards and test logs
│
├── documentation/                # Architecture & Design Documents
│   ├── architecture.md           # Three-tier architecture & concurrency engine
│   ├── database-design.md        # Entity-Relationship diagram & data dictionary
│   └── testing-report.md         # Test specifications & performance benchmarks
│
└── README.md                     # Project master documentation
```

---

## 3. Technology Configuration

- **Frontend**: React 19, Vite 8, Tailwind CSS v4, React Router v7, Axios, Lucide React.
- **Backend**: Node.js v24, Express.js 4, Mongoose 8, JWT, bcryptjs, Helmet, Express-Rate-Limit, PDFKit.
- **Database**: MongoDB (Local service or integrated MongoMemoryServer fallback for zero-friction launch).
- **Test Automation**: Java 25, Selenium WebDriver 4.21, TestNG 7.10, WebDriverManager, ExtentReports.
- **Performance**: Apache JMeter 5.6 test plans.

---

## 4. Setup & Running Instructions

### 4.1 Running the Backend API Server
```bash
cd backend
npm install
node server.js
```
The server will start on port `5000`. You can test the health endpoint:
```bash
http://localhost:5000/api/health
```

### 4.2 Running the Frontend Client
```bash
cd frontend
npm install
npm run dev
```
Open your browser to:
```bash
http://localhost:5173
```

### 4.3 Running Selenium Automation Tests
```bash
cd selenium-tests
mvn clean test
```

---

## 5. Sequential Development Roadmap

- [x] **Phase 1: Project Initialization & Architecture**
  - Scaffolded frontend, backend, test suites, and documentation.
  - Implemented 4-color palette (#FBF0E6, #F7E1C9, #65AFB0, #407778).
  - Built responsive Navbar, Footer, and completed Homepage design language.
  - Configured 9 MongoDB schemas, database connector, and Express server with health check.
- [ ] **Phase 2: UI/UX Design & Remaining Frontend Pages** (Search, Seat Map, Checkout, Profile)
- [ ] **Phase 3: Database Seeding & Backend Search APIs**
- [ ] **Phase 4: Authentication & Authorization APIs**
- [ ] **Phase 5: Railway & Bus Search Integration**
- [ ] **Phase 6: Interactive Seat Map & Concurrency-Safe Booking Engine**
- [ ] **Phase 7: Simulated Payment & PDF Boarding Pass Generation**
- [ ] **Phase 8: Admin Management Dashboard**
- [ ] **Phase 9: Selenium Automation Test Execution**
- [ ] **Phase 10: JMeter Performance & Stress Testing Execution**
- [ ] **Phase 11: Integration Verification & Final Delivery**
