import os
import logging
import resend

logger = logging.getLogger(__name__)

FROM_ADDRESS = "Lumera <noreply@throttleshotsmedia.com>"
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://watchlumera.com")


def _get_api_key() -> str | None:
    return os.getenv("RESEND_API_KEY")


def send_verification_email(to_email: str, username: str, token: str) -> None:
    api_key = _get_api_key()
    if not api_key:
        logger.warning("RESEND_API_KEY not set — skipping verification email for %s", to_email)
        return

    resend.api_key = api_key
    verify_url = f"{FRONTEND_URL}/verify-email?token={token}"

    try:
        resend.Emails.send({
            "from": FROM_ADDRESS,
            "to": to_email,
            "subject": "Verify your Lumera account",
            "html": _verification_html(username, verify_url),
        })
    except Exception as exc:
        # Log but never crash registration over an email failure
        logger.error("Failed to send verification email to %s: %s", to_email, exc)


def _verification_html(username: str, verify_url: str) -> str:
    return f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#111;border:1px solid #2a2a2a;border-radius:12px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding:32px 32px 24px;">
              <p style="margin:0;font-size:28px;font-weight:700;letter-spacing:0.05em;color:#c9a84c;">LUMERA</p>
              <p style="margin:8px 0 0;font-size:13px;color:#666;">The filmmaker's platform</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:0 32px 32px;">
              <p style="margin:0 0 16px;font-size:15px;color:#ccc;">Hi {username},</p>
              <p style="margin:0 0 24px;font-size:15px;color:#888;line-height:1.6;">
                Thanks for joining Lumera. Click below to verify your email address and start uploading your work.
              </p>

              <!-- CTA button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <a href="{verify_url}"
                       style="display:inline-block;padding:13px 32px;background:#c9a84c;color:#000;font-size:14px;font-weight:700;text-decoration:none;border-radius:6px;letter-spacing:0.02em;">
                      Verify email address
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:12px;color:#555;">Or copy this link into your browser:</p>
              <p style="margin:0 0 24px;font-size:11px;color:#444;word-break:break-all;">{verify_url}</p>

              <p style="margin:0;font-size:12px;color:#444;line-height:1.6;">
                This link expires in <strong style="color:#666;">24 hours</strong>.
                If you didn't create a Lumera account, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #1e1e1e;">
              <p style="margin:0;font-size:11px;color:#444;text-align:center;">
                &copy; Lumera &mdash; <a href="https://watchlumera.com" style="color:#555;text-decoration:none;">watchlumera.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""
