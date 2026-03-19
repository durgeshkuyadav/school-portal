package com.school.notification.consumer;

import com.school.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {

    private final EmailService emailService;

    // ✅ Topic name match karta hai AcademicEventProducer se
    @KafkaListener(
        topics = "school.results.published",
        groupId = "notification-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void onResultPublished(
            ConsumerRecord<String, Map<String, Object>> record) {
        try {
            Map<String, Object> event = record.value();
            log.info("📧 Result event: {}", event);

            String email = (String) event.get("recipientEmail");
            String examName = (String) event.getOrDefault(
                "examName", "Exam");

            emailService.sendEmail(
                email,
                "✅ Results Published — " + examName,
                buildResultBody(examName)
            );
        } catch (Exception e) {
            log.error("Error in result event: {}",
                e.getMessage());
        }
    }

    // ✅ Topic name match karta hai AcademicEventProducer se
    @KafkaListener(
        topics = "school.exam.created",
        groupId = "notification-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void onExamCreated(
            ConsumerRecord<String, Map<String, Object>> record) {
        try {
            Map<String, Object> event = record.value();
            log.info("📅 Exam event: {}", event);

            String email = (String) event.get("recipientEmail");
            String examName = (String) event.getOrDefault(
                "examName", "Exam");

            emailService.sendEmail(
                email,
                "📅 New Exam Scheduled — " + examName,
                buildExamBody(examName)
            );
        } catch (Exception e) {
            log.error("Error in exam event: {}",
                e.getMessage());
        }
    }

    // ✅ Topic name match karta hai TaskEventProducer se
    @KafkaListener(
        topics = "school.task.assigned",
        groupId = "notification-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void onTaskAssigned(
            ConsumerRecord<String, Map<String, Object>> record) {
        try {
            Map<String, Object> event = record.value();
            log.info("📋 Task event: {}", event);

            String email = (String) event.get("recipientEmail");
            String title = (String) event.getOrDefault(
                "taskTitle", "Task");
            String by = (String) event.getOrDefault(
                "assignedByName", "Admin");

            emailService.sendEmail(
                email,
                "📋 New Task Assigned — " + title,
                buildTaskBody(title, by)
            );
        } catch (Exception e) {
            log.error("Error in task event: {}",
                e.getMessage());
        }
    }

    private String buildResultBody(String examName) {
        return "<h2>Results Published!</h2>"
            + "<p>Results for <b>" + examName
            + "</b> have been published.</p>"
            + "<p>Login to the portal to check your results.</p>"
            + "<br><small>Vidya Mandir School Portal</small>";
    }

    private String buildExamBody(String examName) {
        return "<h2>New Exam Scheduled</h2>"
            + "<p>Exam <b>" + examName
            + "</b> has been scheduled.</p>"
            + "<p>Login to the portal for details.</p>"
            + "<br><small>Vidya Mandir School Portal</small>";
    }

    private String buildTaskBody(String title, String by) {
        return "<h2>New Task Assigned</h2>"
            + "<p>Task: <b>" + title + "</b></p>"
            + "<p>Assigned by: <b>" + by + "</b></p>"
            + "<p>Login to the portal to view details.</p>"
            + "<br><small>Vidya Mandir School Portal</small>";
    }
}