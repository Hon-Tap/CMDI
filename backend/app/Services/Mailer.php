<?php

declare(strict_types=1);

namespace App\Services;

use PHPMailer\PHPMailer\PHPMailer;

class Mailer
{
    public static function send(
        string $to,
        string $subject,
        string $bodyText,
        ?string $replyToEmail = null,
        ?string $replyToName = null
    ): void {
        $host = (string) getenv('SMTP_HOST');
        $port = (int) (getenv('SMTP_PORT') ?: 587);
        $user = (string) getenv('SMTP_USER');
        $pass = (string) getenv('SMTP_PASS');

        // IMPORTANT: Gmail SMTP will reliably send only when From matches the authenticated user.
        // We'll use SMTP_USER as From, and set Reply-To to your domain mailbox / applicant email.
        $fromEmail = $user;
        $fromName  = (string) (getenv('MAIL_FROM_NAME') ?: 'CMDI Website');

        if ($host === '' || $user === '' || $pass === '') {
            throw new \RuntimeException('SMTP env vars missing (SMTP_HOST/SMTP_USER/SMTP_PASS).');
        }

        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = $host;
        $mail->SMTPAuth   = true;
        $mail->Username   = $user;
        $mail->Password   = $pass;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // port 587
        $mail->Port       = $port;

        $mail->CharSet = 'UTF-8';

        $mail->setFrom($fromEmail, $fromName);
        $mail->addAddress($to);

        if ($replyToEmail) {
            $mail->addReplyTo($replyToEmail, $replyToName ?: $replyToEmail);
        }

        $mail->Subject = $subject;
        $mail->Body    = $bodyText;
        $mail->AltBody = $bodyText;
        $mail->isHTML(false);

        $mail->send();
    }
}
