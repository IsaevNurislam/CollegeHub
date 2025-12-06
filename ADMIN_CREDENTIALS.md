# Admin Login Credentials

Use these credentials to log in to the Admin Dashboard.

**URL:** `/admin` (or `https://college-hub-topaz.vercel.app/admin`)

| Field | Value |
|-------|-------|
| **Student ID** | `000001` |
| **Password** | `Admin@2025` |

## Troubleshooting
If you receive a "401 Invalid credentials" error on Vercel:
1. Ensure the latest deployment (Commit `426fa5a`) has finished.
2. The system now has a bypass to accept `Admin@2025` even if the database is stale.
