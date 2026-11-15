# Test Automation & Performance Verification Plan
## Online Railway & Bus Ticket Booking System

### 1. Test Automation Strategy (Selenium WebDriver + TestNG)

The automated testing framework is established as a standalone Maven Java project under `selenium-tests/`, adhering to the **Page Object Model (POM)** pattern.

#### Test Execution Suite Coverage:
| Test ID | Test Scenario | Target Component | Validation Metric |
| :--- | :--- | :--- | :--- |
| **TC-01** | Homepage Loading & Rendering | HomePage | Hero, search widget, and navigation elements present |
| **TC-02** | Customer Registration | RegisterPage | Successful account creation and redirection |
| **TC-03** | Valid Customer Login | LoginPage | JWT token stored, user profile visible in navbar |
| **TC-04** | Invalid Login Handling | LoginPage | Error toast / validation prompt on bad credentials |
| **TC-05** | Customer Logout | Navbar | Token cleared, UI transitions to guest state |
| **TC-06** | Railway Search | TrainSearchPage | Filtered train list returned for source & destination |
| **TC-07** | Bus Search | BusSearchPage | Filtered bus list returned for source & destination |
| **TC-08** | Station Validation | SearchWidget | Validation error if source and destination are identical |
| **TC-09** | Interactive Seat Selection | SeatLayoutModal | Selected seat turns deep teal with updated fare total |
| **TC-10** | Booked Seat Lock Validation | SeatLayoutModal | Previously booked seats disabled and non-clickable |
| **TC-11** | Passenger Form Validation | CheckoutPage | Required name, age, and gender validation checks |
| **TC-12** | Successful Booking Flow | CheckoutPage | Complete simulated checkout and booking generation |
| **TC-13** | Simulated Payment Failure | PaymentModal | Graceful failure message and seat release check |
| **TC-14** | Booking Confirmation View | ConfirmationPage | 10-digit PNR, booking ID, and journey summary displayed |
| **TC-15** | Digital Ticket PDF Download | ConfirmationPage | Verification of generated PDF file headers |
| **TC-16** | Customer Booking History | MyBookingsPage | List of user's active and past bookings rendered |
| **TC-17** | Booking Cancellation | MyBookingsPage | Ticket cancelled, refund calculated, seat freed |
| **TC-18** | Admin Portal Login | AdminLoginPage | Admin credentials validated and dashboard presented |
| **TC-19** | Unauthorized Access Guard | ProtectedRoute | Regular customer redirected if accessing admin routes |

---

### 2. Performance & Stress Testing Plan (Apache JMeter)

Performance tests simulate real-world booking traffic spikes:

- **Load Testing (`load-test.jmx`)**: 50 concurrent virtual users ramping over 30 seconds across 10 loops. Focuses on search throughput and latency.
- **Stress & Spike Testing (`stress-test.jmx`)**: 200 concurrent threads ramping up over 10 seconds. Evaluates database connection pooling, CPU utilization, and rate-limiting behavior.

#### Target Performance Benchmarks:
- **Search API Response Time**: Average < 150ms (90th percentile < 250ms).
- **Seat Availability API Response Time**: Average < 80ms.
- **Booking Creation & Concurrency Lock**: Average < 300ms.
- **System Error Rate**: 0.00% under normal load (< 1% under peak stress).
