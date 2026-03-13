package com.school.content.repository;

import com.school.content.document.Content;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ContentRepository extends MongoRepository<Content, String> {
    List<Content> findByClassIdAndScopeAndPublishedTrue(Long classId, String scope);
    List<Content> findByClassIdAndScopeAndSubjectIdInAndPublishedTrue(Long classId, String scope, List<Long> subjectIds);
    List<Content> findByUploadedByUserId(Long userId);
    List<Content> findByClassIdAndPublishedTrue(Long classId);
}
