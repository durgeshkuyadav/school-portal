package com.school.student.kafka;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class TaskEventProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public static final String TOPIC_TASK_ASSIGNED =
        "school.task.assigned";

    public void publishTaskAssigned(
            Long taskId,
            String taskTitle,
            String assignedByName) {

        Map<String, Object> event = Map.of(
            "type",           "TASK_ASSIGNED",
            "taskId",         taskId,
            "taskTitle",      taskTitle,
            "assignedByName", assignedByName,
            "recipientEmail", "kpmedicalshop0@gmail.com",
            "timestamp",      System.currentTimeMillis()
        );

        kafkaTemplate.send(
            TOPIC_TASK_ASSIGNED,
            "task-" + taskId,
            event
        );
        log.info("📋 Task assigned event sent: {}",
            taskTitle);
    }
}
