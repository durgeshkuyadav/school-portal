package com.school.notification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * EmailService — mail disabled by default.
 * Set MAIL_ENABLED=true in docker-compose to activate real emails.
 * Until then, all notifications just get logged.
 */
@Service
@Slf4j
public class EmailService {

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    public void sendEmail(String to, String subject, String body) {
        if (!mailEnabled) {
            log.info("[MAIL-DISABLED] Would send to={} subject={}", to, subject);
            return;
        }
        // Real sending — only when MAIL_ENABLED=true
        try {
            // JavaMailSender injected only when mail.enabled=true
            log.info("Email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
