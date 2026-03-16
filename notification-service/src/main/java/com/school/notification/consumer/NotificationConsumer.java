package com.school.notification.consumer;

import com.school.notification.dto.NotificationEvent;
import com.school.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {

    private final EmailService emailService;

    @KafkaListener(topics = "result-published", groupId = "notification-group",
                   containerFactory = "kafkaListenerContainerFactory")
    public void onResultPublished(ConsumerRecord<String, NotificationEvent> record, Acknowledgment ack) {
        try {
            NotificationEvent event = record.value();
            log.info("📧 Result published event received: {}", event);
            emailService.sendEmail(
                event.getRecipientEmail(),
                "Results Published — " + event.getTitle(),
                event.getMessage()
            );
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Error processing result-published event: {}", e.getMessage());
            ack.acknowledge(); // acknowledge anyway to avoid infinite retry
        }
    }

    @KafkaListener(topics = "exam-created", groupId = "notification-group",
                   containerFactory = "kafkaListenerContainerFactory")
    public void onExamCreated(ConsumerRecord<String, NotificationEvent> record, Acknowledgment ack) {
        try {
            NotificationEvent event = record.value();
            log.info("📅 Exam created event received: {}", event);
            emailService.sendEmail(
                event.getRecipientEmail(),
                "New Exam Scheduled — " + event.getTitle(),
                event.getMessage()
            );
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Error processing exam-created event: {}", e.getMessage());
            ack.acknowledge();
        }
    }

    @KafkaListener(topics = "content-uploaded", groupId = "notification-group",
                   containerFactory = "kafkaListenerContainerFactory")
    public void onContentUploaded(ConsumerRecord<String, NotificationEvent> record, Acknowledgment ack) {
        try {
            NotificationEvent event = record.value();
            log.info("📚 Content uploaded event received: {}", event);
            emailService.sendEmail(
                event.getRecipientEmail(),
                "New Study Material — " + event.getTitle(),
                event.getMessage()
            );
            ack.acknowledge();
        } catch (Exception e) {
            log.error("Error processing content-uploaded event: {}", e.getMessage());
            ack.acknowledge();
        }
    }
}
