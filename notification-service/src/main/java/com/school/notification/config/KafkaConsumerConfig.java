package com.school.notification.config;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import java.util.HashMap;
import java.util.Map;

@EnableKafka
@Configuration
public class KafkaConsumerConfig {

    @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
    private String bootstrapServers;

    @Bean
    public ConsumerFactory<String, Map<String, Object>>
            consumerFactory() {

        // ✅ Map deserializer — matches what producers send
        JsonDeserializer<Map<String, Object>> deserializer =
            new JsonDeserializer<>();
        deserializer.addTrustedPackages("*");
        deserializer.setUseTypeMapperForKey(false);

        Map<String, Object> props = new HashMap<>();
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG,
            bootstrapServers);
        props.put(ConsumerConfig.GROUP_ID_CONFIG,
            "notification-group");
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG,
            "earliest");
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG,
            true);
        props.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG,
            10);

        return new DefaultKafkaConsumerFactory<>(
            props,
            new StringDeserializer(),
            deserializer
        );
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory
            String, Map<String, Object>>
            kafkaListenerContainerFactory() {

        ConcurrentKafkaListenerContainerFactory
                String, Map<String, Object>> factory =
            new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        factory.setConcurrency(3);
        return factory;
    }
}