package com.school.notification.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;

/**
 * MailConfig — Mail auto-configuration is only active when app.mail.enabled=true.
 * By default mail is OFF so service won't crash on startup without mail credentials.
 */
@Configuration
@ConditionalOnProperty(name = "app.mail.enabled", havingValue = "true", matchIfMissing = false)
public class MailConfig {
    // Spring Boot's MailSenderAutoConfiguration handles the actual bean creation.
    // This class just gates it behind the property flag.
}
