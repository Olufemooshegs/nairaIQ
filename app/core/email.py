from email.message import EmailMessage
import os
import aiosmtplib


async def send_email_async(to: str, subject: str, body: str, html: str | None = None) -> None:
    server = os.getenv("SMTP_SERVER")
    if not server:
        raise RuntimeError("SMTP_SERVER not configured")

    port = int(os.getenv("SMTP_PORT", "587"))
    username = os.getenv("SMTP_USERNAME")
    password = os.getenv("SMTP_PASSWORD")
    from_addr = os.getenv("SMTP_FROM", f"no-reply@{os.getenv('APP_DOMAIN','nairaiq.local')}")
    use_tls = os.getenv("SMTP_USE_TLS", "true").lower() in ("1", "true", "yes")

    msg = EmailMessage()
    msg["From"] = from_addr
    msg["To"] = to
    msg["Subject"] = subject

    if html:
        msg.set_content(body)
        msg.add_alternative(html, subtype="html")
    else:
        msg.set_content(body)

    await aiosmtplib.send(
        msg,
        hostname=server,
        port=port,
        username=username,
        password=password,
        start_tls=use_tls,
    )
