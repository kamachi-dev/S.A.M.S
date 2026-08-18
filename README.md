# S.A.M.S — Student Attendance Management System

Web frontend for the Student Attendance Management System. Provides Google sign-in and separate admin, teacher, and parent sections.

Authentication and data APIs are handled by the PHP backend in the `SAMS-Backend` repository.

## Structure

- `index.html` / `login.css` / `login.js` — login page with Google sign-in
- `admin/`, `teacher/`, `parent/` — role-based sections
- `general/` — shared styles and utilities
- `assets/` — images and branding
