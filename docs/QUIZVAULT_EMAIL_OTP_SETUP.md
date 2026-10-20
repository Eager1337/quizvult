# QuizVault email OTP setup

QuizVault uses passwordless email OTP: users enter their email, receive a code, and enter that code in the app. No authenticator app or password is required.

## Why Supabase blocks editing the email template

Supabase's built-in email sender is for development only. It can send only to pre-authorized project team addresses and is rate-limited. To send codes to ordinary users and edit the email subject/body, configure a custom SMTP provider.

## Configure SMTP

1. Create an account with an SMTP provider such as Resend, Brevo, Postmark, SendGrid, or AWS SES.
2. Verify a domain you control with that provider and complete its sender/DNS verification steps. Do not use a sender address on a domain you do not control.
3. In the provider's SMTP settings, copy the SMTP host, port, username, and password.
4. In the Supabase dashboard for project `sqqcwbsywelydnsdzlis`, open **Project Settings → Authentication** (or **Authentication → Settings**) and enable custom SMTP.
5. Enter the SMTP host, port (commonly 587 with STARTTLS), username, password, sender email on your verified domain, and sender name `QuizVault`. Save the settings.
6. Open **Authentication → Email Templates → Magic Link**. Set the subject to `Your QuizVault sign-in code` and use this body:

```html
<h2>Your QuizVault sign-in code</h2>
<p>Use the one-time code below to sign up or sign in to QuizVault.</p>
<p style="font-size: 28px; font-weight: 700; letter-spacing: 6px;">{{ .Token }}</p>
<p>If you did not request this code, you can ignore this email.</p>
```

The key requirement is `{{ .Token }}`. If the template uses only `{{ .ConfirmationURL }}`, it sends a link instead of the code expected by QuizVault.

## Test checklist

- Test signup using an email address you can access.
- Confirm the email contains a numeric code, not only a link.
- Enter the code in QuizVault and confirm the workspace loads.
- Sign out and test sign-in with the same email.
- Test an invalid code and a resend request.
- Check provider delivery logs and Supabase Auth logs if a message does not arrive.

## Important

- Keep SMTP credentials private. Never put SMTP credentials or a Supabase service-role key in frontend code or GitHub.
- The app's Supabase URL and publishable key are used by the browser; SMTP credentials belong only in Supabase's server-side Auth settings.
- Supabase may enforce an OTP resend interval and expiry configured in Auth settings.
- The repository code can request and verify codes, but actual delivery cannot be confirmed until SMTP is configured and a real inbox test is completed.
