package HelpNearby.repository;

import HelpNearby.entity.EmergencyRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EmergencyRequestRepository extends JpaRepository<EmergencyRequest, Long> {
    List<EmergencyRequest> findByRequesterEmailOrderByCreatedAtDesc(String requesterEmail);
    List<EmergencyRequest> findByStatusOrderByCreatedAtDesc(EmergencyRequest.Status status);
}
