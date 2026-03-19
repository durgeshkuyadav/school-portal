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

    // ✅ FIX 1: Topic name sahi — producer se match karta hai
    // ✅ FIX 2: Map<String, Object> — producer se match karta hai
    // ✅ FIX 3: Acknowledgment hata diya — auto-commit use karega
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

            emailService.sendResultEmail(
                (String) event.get("recipientEmail"),
                (String) event.getOrDefault(
                    "examName", "Exam")
            );
        } catch (Exception e) {
            log.error("❌ Result event error: {}",
                e.getMessage());
        }
    }

    // ✅ FIX 1: school.exam.created — sahi topic
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

            emailService.sendExamEmail(
                (String) event.get("recipientEmail"),
                (String) event.getOrDefault(
                    "examName", "Exam")
            );
        } catch (Exception e) {
            log.error("❌ Exam event error: {}",
                e.getMessage());
        }
    }

    // ✅ FIX 1: school.task.assigned — ye topic hi missing tha!
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

            emailService.sendTaskEmail(
                (String) event.get("recipientEmail"),
                (String) event.getOrDefault(
                    "taskTitle", "Task"),
                (String) event.getOrDefault(
                    "assignedByName", "Admin")
            );
        } catch (Exception e) {
            log.error("❌ Task event error: {}",
                e.getMessage());
        }
    }
}