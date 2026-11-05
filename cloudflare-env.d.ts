declare namespace Cloudflare {
  interface Env {
    APP_ENV?: 'production' | 'staging' | 'preview';
    ADMIN_PASSWORD_HASH?: string;
    CUSTOMER_SHEET_SYNC_KEY?: string;
    RESEND_API_KEY?: string;
    FROM_EMAIL?: string;
    DB?: D1Database;
    BUCKET?: R2Bucket;
  }
}
