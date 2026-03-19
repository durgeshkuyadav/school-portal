package com.school.notification.service;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    // ✅ JavaMailSender inject kiya — Spring auto-configure
    // karega jab mail settings yml mein hain
    private final JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from:noreply@school.com}")
    private String fromEmail;

    // Constructor injection — mailSender null bhi ho sakta
    // hai agar mail disabled ho
    public EmailService(
            @org.springframework.beans.factory.annotation
                .Autowired(required = false)
            JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(
            String to,
            String subject,
            String htmlBody) {

        if (!mailEnabled) {
            log.info("[MAIL-DISABLED] to={} subject={}",
                to, subject);
            return;
        }

        if (to == null || to.isBlank()) {
            log.warn("⚠️ Email recipient is empty, skip");
            return;
        }

        if (mailSender == null) {
            log.error("❌ JavaMailSender not available!");
            return;
        }

        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                new MimeMessageHelper(msg, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = HTML

            mailSender.send(msg);
            log.info("✅ Email sent to: {} | {}",
                to, subject);

        } catch (Exception e) {
            log.error("❌ Email send failed to {}: {}",
                to, e.getMessage());
        }
    }
}