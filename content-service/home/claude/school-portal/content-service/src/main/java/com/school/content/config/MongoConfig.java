package com.school.content.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@Configuration
@EnableMongoAuditing
@EnableMongoRepositories(basePackages = "com.school.content.repository")
public class MongoConfig {
    // MongoDB connection is configured via spring.data.mongodb.uri in application.yml
    // This class enables auditing and repository scanning
}
