# System Architecture & Technical Specifications
## Online Railway & Bus Ticket Booking System

### 1. Architectural Overview

The **RailBus** platform is built on an enterprise-grade **Three-Tier Modular Architecture** combining a responsive React frontend, a RESTful Node.js/Express backend service layer, and a high-throughput MongoDB document database. The system is designed to guarantee high availability, zero seat double-booking, and verifiable automated testing via Selenium WebDriver and Apache JMeter.

```
+-------------------------------------------------------------------------+
|                          CLIENT PRESENTATION TIER                       |
|  - React 19 + Vite 8 SPA                                                |
|  - Strict 4-Color Visual Design System (#FBF0E6, #F7E1C9, #65AFB0, #407778) |
|  - Interactive SVG & CSS Grid Seat Map (Train coaches & Bus decks)      |
|  - Axios HTTP Interceptors (JWT Bearer tokens & Centralized Error Hook)  |
|  - React Router v7 Protected Routes & Role Guards                       |
+------------------------------------+------------------------------------+
                                     |  RESTful JSON API / HTTPS
                                     v
+------------------------------------+------------------------------------+
|                         APPLICATION SERVICE TIER                        |
|  - Express.js Application Server (Port 5000)                            |
|  - Security Layer: Helmet headers, CORS policies, Express-Rate-Limit    |
|  - Authentication & RBAC: JWT Stateless Tokens & bcrypt password hashing|
|  - Concurrency-Control Engine: Atomic Seat Reservations & Expiry Timers |
|  - PDF Generation Service: PDFKit Cryptographic Boarding Pass Engine     |
|  - Centralized Error Handling & Request Logging (Morgan)               |
+------------------------------------+------------------------------------+
                                     |  Mongoose ODM (Driver v8.4+)
                                     v
+------------------------------------+------------------------------------+
|                         DATABASE & PERSISTENCE                          |
|  - MongoDB Engine (Primary Service or Embedded High-Speed MongoMemory)  |
|  - 9 Structured Collections with Referential Integrity                 |
|  - Compound & Unique Indexes on Source/Destination/Date and PNR         |
|  - ACID Multi-Document Session Transactions for Safe Seat Allocations   |
+-------------------------------------------------------------------------+
```

---

### 2. Strict 4-Color Visual Identity System

The entire user interface strictly implements the verified four-color palette in a light-mode hierarchy:

| Token / Role | Hex Code | Visual Proportion | UI Application |
| :--- | :--- | :--- | :--- |
| **LIGHT CREAM** | `#FBF0E6` | ~45% | Dominant website background, input field surfaces, outer margins |
| **SOFT PEACH** | `#F7E1C9` | ~25% | Secondary background, search cards, feature highlights, footer |
| **MEDIUM TEAL** | `#65AFB0` | ~20% | Interactive buttons, badges, icons, borders, active indicators |
| **DEEP TEAL** | `#407778` | ~10% | Navbar, primary CTA buttons, page headings, focal branding |

**Design Principles Enforced:**
- **Light Theme Exclusively**: No dark mode or neon accents.
- **High Legibility**: High-contrast dark slate-teal (`#1D3536`) typography on light cream/soft peach backgrounds meeting WCAG AA accessibility standards.
- **Harmonious Spacing & Radii**: Consistent `rounded-2xl` / `rounded-xl` containers with soft ambient shadows (`rgba(64, 119, 120, 0.08)`).

---

### 3. Concurrency-Safe Atomic Seat Allocation Engine

To prevent the classic double-booking anomaly under peak concurrency (e.g. holiday ticket rush), RailBus employs a **Two-Phase Atomic Reservation Algorithm**:

1. **Phase 1: Temporary Lock (Hold Window: 10 Minutes)**
   - When a passenger selects a seat and initiates checkout, the seat status is updated from `available` to `reserved` using an atomic MongoDB query:
     ```javascript
     SeatInventory.findOneAndUpdate(
       { schedule: scheduleId, "seats.seatNumber": seatNumber, "seats.status": "available" },
       { $set: { "seats.$.status": "reserved", "seats.$.reservedBy": userId, "seats.$.reservedAt": new Date() } }
     );
     ```
   - If two passengers click the same seat at the exact same millisecond, MongoDB's document-level write lock ensures only the first operation modifies the document. The second receives `null` and the user is immediately notified that the seat was just claimed.
2. **Phase 2: Confirmation or Automated Expiry Rollback**
   - Upon successful simulated payment, the seat status is atomically transitioned to `booked` with a permanent `bookingId` and `pnr`.
   - If the payment is not completed within 10 minutes, the hold expires and background sweeps return the seat to `available`.

---

### 4. Quality Assurance & Verification Architecture

1. **Automated End-to-End Regression**:
   - **Selenium WebDriver 4.21** + **Java 17/25** + **TestNG 7.10** configured in `selenium-tests/`.
   - **Page Object Model (POM)** architecture separating UI locators from test logic.
   - 19 automated test scenarios covering authentication, journey search, seat selection, validation, checkout, PDF ticket generation, and admin operations.
2. **Performance & Stress Testing**:
   - **Apache JMeter 5.6** test plans in `jmeter-tests/`.
   - Multi-threaded user loads measuring 90th percentile response times, throughput, and zero-defect concurrency handling.
