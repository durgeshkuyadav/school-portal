package com.school.notification.service;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    // ✅ required=false — mail disabled ho toh crash na ho
    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from:noreply@school.com}")
    private String fromEmail;

    // ── Public methods — Consumer ye call karta hai ────

    public void sendResultEmail(String to, String examName) {
        String subject = "✅ Results Published — " + examName;
        String body = buildHtml(
            "Results Published!",
            "Results for <b>" + examName
            + "</b> are now available.",
            "Login to the portal to check your marks."
        );
        send(to, subject, body);
    }

    public void sendExamEmail(String to, String examName) {
        String subject = "📅 New Exam Scheduled — " + examName;
        String body = buildHtml(
            "New Exam Scheduled",
            "Exam <b>" + examName
            + "</b> has been scheduled.",
            "Login to the portal for full details."
        );
        send(to, subject, body);
    }

    public void sendTaskEmail(
            String to, String taskTitle, String assignedBy) {
        String subject = "📋 New Task — " + taskTitle;
        String body = buildHtml(
            "Task Assigned",
            "Task: <b>" + taskTitle + "</b>",
            "Assigned by: <b>" + assignedBy + "</b>. "
            + "Please login to view details."
        );
        send(to, subject, body);
    }

    // ── Private: actual sending ────────────────────────

    private void send(
            String to, String subject, String htmlBody) {

        if (!mailEnabled) {
            log.info("[MAIL-OFF] to={} | subject={}",
                to, subject);
            return;
        }
        if (to == null || to.isBlank()) {
            log.warn("⚠️ No recipient — skip");
            return;
        }
        if (mailSender == null) {
            log.error("❌ JavaMailSender not configured!");
            return;
        }

        try {
            MimeMessage msg =
                mailSender.createMimeMessage();
            MimeMessageHelper helper =
                new MimeMessageHelper(msg, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(msg);
            log.info("✅ Email sent → {} | {}",
                to, subject);

        } catch (Exception e) {
            log.error("❌ Email failed → {}: {}",
                to, e.getMessage());
        }
    }

    // ── Private: HTML template ─────────────────────────

    private String buildHtml(
            String heading,
            String line1,
            String line2) {
        return "<div style='font-family:sans-serif;"
            + "max-width:520px;margin:auto;"
            + "border:1px solid #ddd;border-radius:8px;"
            + "overflow:hidden'>"
            + "<div style='background:#0B1F3A;"
            + "color:white;padding:20px 24px'>"
            + "<h2 style='margin:0;font-size:18px'>"
            + "🏫 Vidya Mandir School Portal</h2></div>"
            + "<div style='padding:24px'>"
            + "<h3 style='color:#0B1F3A;margin-top:0'>"
            + heading + "</h3>"
            + "<p style='color:#444;line-height:1.6'>"
            + line1 + "</p>"
            + "<p style='color:#666;font-size:14px'>"
            + line2 + "</p>"
            + "<a href='http://localhost:3000' "
            + "style='display:inline-block;"
            + "background:#1565C0;color:white;"
            + "padding:10px 20px;border-radius:6px;"
            + "text-decoration:none;margin-top:12px'>"
            + "Open Portal</a>"
            + "</div>"
            + "<div style='background:#f5f5f5;"
            + "padding:12px 24px;font-size:12px;"
            + "color:#999'>Vidya Mandir — "
            + "Automated Notification</div></div>";
    }
}