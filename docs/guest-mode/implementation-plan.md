# Guest Mode Implementation

## Goal Description
Add a "Continue as Guest" option to the authentication page. This allows users to try the application without creating an account. Guest users will have a temporary identity and a starter balance.

## User Review Required
> [!NOTE]
> Guest sessions are currently ephemeral. If a guest user refreshes the page, their progress (balance) essentially resets or disappears depending on implementation details. I will implement a basic in-memory guest user for now.

## Proposed Changes

### Context
#### [MODIFY] `AppContext.tsx`
- Add `continueAsGuest` to `AppContextType`.
- Implement `continueAsGuest` in `AppProvider`:
    - Creates a mock user object with ID `guest_<timestamp>`, name "Guest", and initial balance (e.g., $1000).
    - Sets this user to state.
    - Clears any existing auth tokens.

### Pages
#### [MODIFY] `Auth.tsx`
- Extract "Continue as Guest" button from designs.
- Add the button to the UI, likely below the "Sign In" button or as a secondary action.
- Call `continueAsGuest()` and navigate to home on click.

## Verification Plan

### Manual Verification
1.  **Open Auth Page**: Navigate to the root/auth URL.
2.  **Click Guest Button**: Click "Continue as Guest".
3.  **Verify Redirect**: Ensure redirection to the home page (`/`).
4.  **Verify User State**: Check if the header shows "Guest" and balance is displayed.
5.  **Play Game**: Try spinning to ensure balance updates work for guest.