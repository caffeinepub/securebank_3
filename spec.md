# SecureBank

## Current State
New project, no existing code.

## Requested Changes (Diff)

### Add
- User registration and login with password-based authentication
- User profile page with personal info (name, email, phone, address)
- Bank account creation and management per user
- Account balance display that updates in real-time after transfers
- Fund transfer between accounts (by account number)
- Transaction history per account
- Dashboard showing all user accounts and total balance

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Authorization component for login/signup with password security
2. Backend: User profiles stored per principal, bank accounts with balances, transaction records, transfer function that atomically updates both sender and receiver balances
3. Frontend: Login/Register page, Dashboard with account cards and balance, Transfer form, Transaction history, Profile page
4. Balance updates reactively after every transfer
