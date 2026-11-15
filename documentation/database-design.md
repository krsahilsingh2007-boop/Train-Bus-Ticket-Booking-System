# Database Design & Data Architecture
## Online Railway & Bus Ticket Booking System

### 1. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USER ||--o{ BOOKING : creates
    USER ||--o{ PAYMENT : makes
    USER ||--o{ CANCELLATION : requests
    
    ROUTE ||--o{ SCHEDULE : defines
    TRAIN ||--o{ SCHEDULE : operates
    BUS ||--o{ SCHEDULE : operates
    
    SCHEDULE ||--|| SEAT_INVENTORY : manages
    SCHEDULE ||--o{ BOOKING : reserved_under
    
    BOOKING ||--|| PAYMENT : verified_by
    BOOKING ||--o| CANCELLATION : subject_to
    
    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string role "customer | admin"
        string phone
        date createdAt
    }

    TRAIN {
        ObjectId _id PK
        string trainNumber UK
        string trainName
        string trainType
        number totalCoaches
        string[] classesSupported
        boolean isActive
    }

    BUS {
        ObjectId _id PK
        string busNumber UK
        string operatorName
        string busType
        number totalSeats
        boolean isActive
    }

    ROUTE {
        ObjectId _id PK
        string source
        string destination
        number distanceKm
        string estimatedDuration
        string serviceType "train | bus"
        array stops
    }

    SCHEDULE {
        ObjectId _id PK
        string serviceType "train | bus"
        ObjectId train FK
        ObjectId bus FK
        ObjectId route FK
        string departureTime
        string arrivalTime
        string journeyDate "YYYY-MM-DD"
        map fares
        string status
    }

    SEAT_INVENTORY {
        ObjectId _id PK
        ObjectId schedule FK
        number totalSeats
        number availableCount
        array seats "Subdocuments"
    }

    BOOKING {
        ObjectId _id PK
        string bookingId UK
        string pnr UK
        ObjectId user FK
        ObjectId schedule FK
        string serviceType
        array passengers
        number totalFare
        string bookingStatus
        string paymentStatus
        ObjectId payment FK
    }

    PAYMENT {
        ObjectId _id PK
        string paymentId UK
        ObjectId booking FK
        ObjectId user FK
        number amount
        string currency
        string paymentMethod
        string status
        string transactionRef
    }

    CANCELLATION {
        ObjectId _id PK
        string cancellationId UK
        ObjectId booking FK
        ObjectId user FK
        string pnr
        string[] cancelledSeats
        number originalFare
        number refundAmount
        string status
    }
```

---

### 2. Collection Schemas & Data Dictionary

#### 2.1 Users Collection
- **`_id`**: Unique ObjectId.
- **`email`**: String, unique, lowercase, indexed. Primary authentication identifier.
- **`password`**: String, bcrypt hashed (cost factor 10), hidden by default (`select: false`).
- **`role`**: Enum (`customer`, `admin`), default `customer`.
- **`phone`**: String, optional customer contact number.

#### 2.2 Trains & Buses Collections
- **`trainNumber` / `busNumber`**: Unique alphanumeric identification strings (e.g. `12952`, `KA-01-F-7788`).
- **`classesSupported`**: Array of coach classes (`1AC`, `2AC`, `3AC`, `CC`, `SL`).
- **`totalSeats` / `totalCoaches`**: Capacity planning attributes.

#### 2.3 Routes Collection
- **`source` / `destination`**: Clean normalized city/station names.
- **`stops`**: Array of intermediate halt stations with distance and halt timings.
- **Compound Index**: `{ source: 1, destination: 1, serviceType: 1 }` for sub-millisecond search queries.

#### 2.4 Schedules Collection
- **`journeyDate`**: Format `YYYY-MM-DD` indexed with `serviceType` for fast calendar lookups.
- **`fares`**: Dynamic pricing map for each seat tier (e.g. `1AC: 45.00, 2AC: 32.00, SL: 15.00`).

#### 2.5 Seat Inventory Collection
- **`schedule`**: 1-to-1 reference to the schedule.
- **`seats`**: Subdocuments containing:
  - `seatNumber`: e.g. `A1`, `B2`, `S14`, `U3`
  - `seatClass`: e.g. `1AC`, `2AC`, `Sleeper`, `Seater`
  - `berthType`: `Window`, `Aisle`, `Lower Berth`, `Upper Berth`, etc.
  - `status`: `available`, `reserved`, `booked`
  - `reservedBy`: User ObjectId
  - `reservedAt`: Timestamp for auto-release expiration

#### 2.6 Bookings, Payments & Cancellations
- **`pnr`**: 10-character unique verification code generated on payment confirmation.
- **`passengers`**: Detailed passenger manifest containing name, age, gender, assigned seat, and fare.
- **`payment`**: Reference to simulated transaction with sandbox transaction reference.
- **`cancellation`**: Full audit trail recording refunded amounts and restored seat inventory.
