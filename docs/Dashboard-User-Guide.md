# Admin Dashboard - Customer Guide

Last updated: 2026-03-20

This guide explains how to use the AppGeo/Miining admin dashboard to manage site content, images, team profiles, careers, and to review incoming enquiries.

## 1) Logging in

1. Open the admin login page: `/admin/login`
2. Sign in with your email and password
3. If you are a new admin or your account needs setup:
   - Choose `First time / Set password`
   - Enter your email
   - Enter the OTP you receive by email
   - Set your new password
4. If you forgot your password:
   - Choose `Forgot password`
   - Enter your email
   - Enter the reset OTP and set a new password

Note: Access to each dashboard section depends on your role/permissions. If a menu item is missing, you likely do not have access.

## 2) Dashboard overview (where to start)

After signing in, you will land on `/admin/dashboard`.

The Dashboard provides:

- At-a-glance stats (cards)
- Latest leads preview (inbox-style preview)
- Recent admin activity (audit log preview)
- Quick links to the sections you have permission to access

How to use it:

1. Use the cards to see counts (for example: gallery items, published team members, openings, users, etc.)
2. Use the `Latest leads` panel to quickly open Contact enquiries or Career applications
3. Use `Recent admin activity` to confirm changes that were made recently
4. Use `Quick links` to jump to the section you want to update

## 3) Navigation menu (left sidebar)

From the sidebar you can access the sections below (your availability depends on permissions):

- `Dashboard`
- `Settings` (site copy and content blocks)
- `Team` (team members and their visibility)
- `Gallery` (gallery images and homepage hero slider)
- `Users` (manage admin users and their access)
- `Audit Logs` (security and change history)
- `Contact` (contact form submissions)
- `Openings` (job openings shown on the public Careers page)
- `Careers` (career applications / candidates)

## 4) Using each dashboard section

### A) Settings

Purpose: Edit the JSON objects that power the public website content blocks.

What you can edit:

- `site`
- `about`
- `nav`
- `quickStats`
- `solutions`
- `services`
- `projects`

How to use:

1. Open `Settings`
2. Edit the JSON in the text areas
3. Click `Save settings`
4. Public pages will reflect updates after the site reloads content

Important:

- Keep valid JSON format. If JSON is invalid, saving will fail.

### B) Team

Purpose: Create, edit, and publish team member profiles.

How to use:

1. Open `Team`
2. To create a member:
   - Click `Add member` (or start with `New` when editing an existing entry)
   - Enter Name, Education, Position, Bio
   - Upload a photo (photo is stored on the server and returned as a public URL)
   - Set Photo position (for example: `50% 16%`)
   - Set Sort order
   - Toggle `Published`
   - Click the main submit button (`Add member` / `Save changes`)
3. To edit:
   - Click `Edit` on a team card
   - Update fields and save
4. To hide/unpublish:
   - Click `Unpublish` on the member card
5. To delete permanently:
   - Some accounts (super admin) can use `Hard delete`

Tip:

- Use `Published` to control visibility on the public Team page.

### C) Gallery

Purpose: Manage gallery images and the homepage hero slider.

How to use:

1. Open `Gallery`
2. Upload an image:
   - Add optional `Alt text`
   - Choose an image file (`jpg/png/webp`)
   - Click `Upload image`
3. Publish/unpublish:
   - Toggle `Published` on each image card/row
4. Add/remove from the homepage hero slider:
   - Toggle `Homepage slider` for images you want shown on the home page
5. Reorder images:
   - Use `Up` / `Down` buttons to change sort order
6. Delete (soft delete):
   - Use `Delete` to unpublish and hide the image from the website

Tip:

- For the homepage slider to show an image, it must be both `Published` and marked `Homepage slider`.

### D) Users & RBAC

Purpose: Manage admin accounts and their access permissions.

How to use:

1. Open `Users & RBAC`
2. You will see tabs/areas for:
   - Create User
   - OTP Verification
   - Forget Password (password reset)
3. Create a user:
   - Enter email
   - Enter (or omit) password depending on your actor role (some roles rely on OTP setup)
   - Choose a role
   - Optionally toggle `Require OTP verification`
   - Submit `Create user`
4. Verify user email (OTP):
   - Request OTP with a user email
   - Enter OTP to confirm
5. Disable user:
   - Click `Disable` for the user you want to deactivate
6. Reset password:
   - Request reset OTP for the user email
   - Confirm with OTP and a new password

Important:

- Disabled users cannot login and OTP/reset codes are invalidated.

### E) Contact submissions

Purpose: Review enquiry messages sent from the public Contact page.

How to use:

1. Open `Contact`
2. Use `Refresh` to reload latest submissions
3. In the table, click `View` to open a dialog showing:
   - Name
   - Phone (if provided)
   - Requirement / message content

### F) Openings (Career listings)

Purpose: Manage job openings shown on the public Careers page.

How to use:

1. Open `Openings`
2. To create an opening:
   - Fill Title, Employment type, Location (optional), Summary (optional), Requirements (optional)
   - Set Sort order
   - Toggle `Published`
   - Click `Add opening`
3. To edit an opening:
   - Click `Edit`
   - Update fields and save
4. To hide/unpublish:
   - Click `Hide` on an opening (sets it to unpublished)

### G) Careers (Career applications)

Purpose: Review candidate applications submitted from the public Careers page.

How to use:

1. Open `Careers`
2. Filter by opening:
   - Use the dropdown to view applications for a specific job
3. Click `View` in the table to open the application dialog showing:
   - Opening
   - Full name and email
   - Phone (if provided)
   - Education, Experience (if provided)
   - Location (if provided)
   - Resume URL (if provided)
   - Message (if provided)

### H) Audit logs

Purpose: View a timeline of key admin actions (security and change history).

How to use:

1. Open `Audit Logs`
2. Click `Refresh` to reload
3. Use `Load more` to paginate older events
4. Each row shows:
   - Time
   - Actor (admin email or system)
   - Action (human readable)
   - Resource (what changed)

## 5) Common issues / troubleshooting

- You are redirected to `/admin/login`:
  - Your session expired; sign in again.
- You see `/admin/not-authorized`:
  - Your account does not have permission for that page.
- Settings fail to save:
  - The JSON you entered is invalid. Fix formatting and retry.
- You do not see menu items:
  - Your role does not include the required permission keys.

