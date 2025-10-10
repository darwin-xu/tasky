# EPIC 6 Stories: User Management

This document breaks down EPIC 6 into individual user stories, following the INVEST principles.

---

### Story 1: User Registration (Email/Password)

*   **As a** visitor,
*   **I want** to create an account with email and password,
*   **so that** I can save my work and return later.

**Acceptance Criteria:**
*   Registration form with fields: email, password, confirm password.
*   Validates email format and password strength; shows clear errors without losing input.
*   On success, user account is created and the user is signed in for the session.

---

### Story 2: User Login & Logout

*   **As a** user,
*   **I want** to log in and log out,
*   **so that** I can access my data securely across sessions.

**Acceptance Criteria:**
*   Login form accepts email and password; invalid credentials show non-revealing errors.
*   Successful login starts an authenticated session; logout ends the session and clears session data.
*   UI reflects authentication state (e.g., user menu, sign out button).

---

### Story 3: Secure Password Storage

*   **As a** developer,
*   **I want** passwords stored securely,
*   **so that** user data remains protected.

**Acceptance Criteria:**
*   Passwords are hashed using an industry-standard algorithm with salt (e.g., bcrypt/argon2) before storage.
*   Plaintext passwords are never stored or logged.
*   Password verification compares hashes securely.

---

### Story 4: Authenticated API Endpoints

*   **As a** user,
*   **I want** my data requests to be protected by authentication,
*   **so that** only I can access my content.

**Acceptance Criteria:**
*   Protected endpoints require a valid session/token; unauthenticated requests get 401.
*   Auth middleware attaches user identity to requests after verification.
*   Rate limiting or basic throttling is in place to reduce abuse.

---

### Story 5: Associate Data to User

*   **As a** user,
*   **I want** my tasks, states, and canvases associated with my account,
*   **so that** my workspace is private and persistent.

**Acceptance Criteria:**
*   New data created while authenticated is scoped to the authenticated user.
*   Listing or fetching resources returns only those owned by the current user.
*   Ownership is enforced at the API layer.

---

### Story 6: Session Persistence (Client)

*   **As a** user,
*   **I want** to stay signed in across page reloads,
*   **so that** I can continue working without frequent logins.

**Acceptance Criteria:**
*   Session persists across reload using secure storage (e.g., http-only cookies or secure token storage pattern).
*   Expired or invalid sessions lead to a graceful sign-out and redirect to login.

---

### Story 7: Profile Basics

*   **As a** user,
*   **I want** a minimal profile view,
*   **so that** I can see and update basic account information.

**Acceptance Criteria:**
*   Profile shows email and optional display name; allows updating display name.
*   Updating profile persists and reflects immediately in the UI.

---

### Story 8: Change Password

*   **As a** user,
*   **I want** to change my password securely,
*   **so that** I can keep my account safe.

**Acceptance Criteria:**
*   Changing password requires the current password and validates new password strength.
*   On success, the user is re-authenticated or asked to log in again; active sessions may be invalidated.
*   Errors do not reveal whether the current password was correct beyond a generic message.

---

### Story 9: Delete or Deactivate Account

*   **As a** user,
*   **I want** to delete or deactivate my account,
*   **so that** I control my data.

**Acceptance Criteria:**
*   Deletion requires explicit confirmation and informs the user about data handling (delete vs. soft-deactivate).
*   After deletion/deactivation, the session is terminated and the user is returned to a signed-out state.
*   Attempting to access protected resources after deletion results in 401.

---

### Story 10: User Management API (CRUD)

*   **As a** developer,
*   **I want** API endpoints for user profile update and deletion,
*   **so that** the client can manage user data securely.

**Acceptance Criteria:**
*   Endpoints require authentication and authorize only the resource owner.
*   Proper HTTP status codes and error messages are returned for invalid or unauthorized actions.
*   Sensitive operations are rate limited.