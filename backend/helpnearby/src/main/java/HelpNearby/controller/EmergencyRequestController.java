package HelpNearby.controller;

import HelpNearby.dto.CreateEmergencyRequest;
import HelpNearby.entity.EmergencyRequest;
import HelpNearby.repository.EmergencyRequestRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/emergency-requests")
@CrossOrigin(origins = "*")
public class EmergencyRequestController {

    private final EmergencyRequestRepository requestRepository;

    public EmergencyRequestController(EmergencyRequestRepository requestRepository) {
        this.requestRepository = requestRepository;
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CreateEmergencyRequest request) {
        EmergencyRequest emergencyRequest = new EmergencyRequest();
        emergencyRequest.setRequesterEmail(request.getRequesterEmail().trim().toLowerCase(Locale.ROOT));
        emergencyRequest.setCategory(request.getCategory().trim());
        emergencyRequest.setDescription(request.getDescription().trim());
        emergencyRequest.setLocation(request.getLocation().trim());
        emergencyRequest.setPriority(parsePriority(request.getPriority()));

        EmergencyRequest saved = requestRepository.save(emergencyRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "message", "Emergency request created successfully",
                "id", saved.getId(),
                "status", saved.getStatus().name()
        ));
    }

    @GetMapping
    public List<EmergencyRequest> list(@RequestParam(required = false) String email,
                                       @RequestParam(required = false) EmergencyRequest.Status status) {
        if (email != null && !email.isBlank()) {
            return requestRepository.findByRequesterEmailOrderByCreatedAtDesc(email.trim().toLowerCase(Locale.ROOT));
        }
        if (status != null) {
            return requestRepository.findByStatusOrderByCreatedAtDesc(status);
        }
        return requestRepository.findAll();
    }

    @PatchMapping("/{id}/accept")
    public ResponseEntity<?> accept(@PathVariable Long id) {
        return requestRepository.findById(id)
                .map(request -> {
                    if (request.getStatus() != EmergencyRequest.Status.PENDING) {
                        return ResponseEntity.badRequest().body(Map.of(
                                "message", "This request is no longer available"
                        ));
                    }

                    request.setStatus(EmergencyRequest.Status.ACCEPTED);
                    EmergencyRequest saved = requestRepository.save(request);
                    return ResponseEntity.ok(Map.of(
                            "message", "Request accepted successfully",
                            "id", saved.getId(),
                            "status", saved.getStatus().name()
                    ));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private EmergencyRequest.Priority parsePriority(String priority) {
        try {
            return EmergencyRequest.Priority.valueOf(priority.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            return EmergencyRequest.Priority.NORMAL;
        }
    }
}
