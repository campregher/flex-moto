DB Migrations (Supabase)

This project stores SQL migrations under `db/migrations`.

Apply migrations locally (requires `psql`):

```bash
export SUPABASE_DB_URL="postgres://user:password@host:port/dbname"
psql "$SUPABASE_DB_URL" -f db/migrations/001_create_profiles_couriers.sql
```

Apply migrations using GitHub Actions:

- Add the secret `SUPABASE_DB_URL` (Postgres connection string) in your GitHub repository settings → Secrets.
- On every push to `main`, the workflow `.github/workflows/apply-migrations.yml` will run and apply all `*.sql` files from `db/migrations`.

Security notes:

- `SUPABASE_DB_URL` contains DB credentials — keep it secret and rotate keys if leaked.
- Prefer using a dedicated DB role with the minimum required privileges for migrations.
