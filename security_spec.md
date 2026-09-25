# Security Specification: Bus Booking System

## 1. Data Invariants
1. A Trip cannot have negative availableSeats or prices.
2. Only Admins can create, delete, or modify core properties of Trips (stations, prices, times).
3. Passengers can only update a Trip to add their chosen seats to `occupiedSeatIds` during an atomic transaction booking, with `occupiedSeatIds` size strictly increasing and preserving all existing occupied seats.
4. A Booking must have a valid `userId` matching `request.auth.uid` and `request.auth.token.email_verified == true`.
5. Only the booking owner (`userId == request.auth.uid`) or an Admin can read a Booking.
6. Only an Admin or the owner can cancel/delete a Booking.
7. Admin status is determined strictly via trusted server checks: `request.auth.token.email == '684234020@parichat.skru.ac.th'` or existence in the `/admins/$(request.auth.uid)` collection with verified email.

## 2. The Dirty Dozen Payloads & Negative Tests
1. **Unauthenticated Trip Creation**: Attempting to create a trip document without being signed in -> DENIED.
2. **Standard User Trip Creation**: Regular authenticated passenger attempting to create a trip document -> DENIED.
3. **Trip Deletion by Non-Admin**: Regular user attempting to delete a trip -> DENIED.
4. **Malicious Seat Reset**: Regular user attempting to empty `occupiedSeatIds` on a trip -> DENIED.
5. **Junk ID Poisoning**: Document creation with an ID containing malicious symbols or exceeding 128 characters -> DENIED.
6. **Booking User Spoofing**: User A creating a booking with `userId` set to User B's UID -> DENIED.
7. **Unverified Email Booking**: User with `email_verified == false` attempting to create a booking -> DENIED.
8. **Booking Snooping**: User A attempting to read User B's booking document -> DENIED.
9. **Booking List Scraping**: User attempting to query all bookings across all users without being admin -> DENIED.
10. **Admin Escalation**: Regular user attempting to write a document into `/admins/{uid}` -> DENIED.
11. **Negative Price/Seat Values**: Modifying trip with negative prices or seats -> DENIED.
12. **Missing Required Fields**: Creating a booking document lacking required passenger or trip details -> DENIED.
