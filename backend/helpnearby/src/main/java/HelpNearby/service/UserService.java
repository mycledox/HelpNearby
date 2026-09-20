package HelpNearby.service;

import HelpNearby.dto.AuthResponse;
import HelpNearby.dto.LoginRequest;
import HelpNearby.dto.RegisterRequest;
import HelpNearby.entity.User;
import HelpNearby.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public User registerUser(RegisterRequest request) {
        String email = request.getEmail() == null ? "" : request.getEmail().trim();
        String fullName = request.getFullName() == null ? "" : request.getFullName().trim();
        String phone = normalizePhone(request.getPhone());

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        if (userRepository.findByPhone(phone).stream().findFirst().isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone number already registered");
        }

        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPhone(phone);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        String roleValue = request.getRole() == null ? "USER" : request.getRole().trim().toUpperCase(Locale.ROOT);
        if (roleValue.equals("ADMIN")) {
            user.setRole(User.Role.ADMIN);
        } else if (roleValue.equals("VOLUNTEER")) {
            user.setRole(User.Role.VOLUNTEER);
        } else {
            user.setRole(User.Role.USER);
        }

        return userRepository.save(user);
    }

    public AuthResponse loginUser(LoginRequest request) {
        String identifier = request.getIdentifier() == null ? "" : request.getIdentifier().trim();
        String password = request.getPassword() == null ? "" : request.getPassword();

        User user = findUserByEmailOrPhone(identifier)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        boolean passwordMatches = passwordEncoder.matches(password, user.getPassword());
        boolean isLegacyPassword = user.getPassword().equals(password);

        if (!passwordMatches && !isLegacyPassword) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        if (isLegacyPassword) {
            user.setPassword(passwordEncoder.encode(password));
            userRepository.save(user);
        }

        return new AuthResponse("Login successful", user.getRole().name(), user.getEmail());
    }

    private java.util.Optional<User> findUserByEmailOrPhone(String identifier) {
        return userRepository.findByEmail(identifier)
                .or(() -> userRepository.findByPhone(normalizePhone(identifier)).stream().findFirst())
                .or(() -> {
                    String normalizedIdentifier = normalizePhone(identifier);
                    return userRepository.findAll().stream()
                            .filter(user -> normalizePhone(user.getPhone()).equals(normalizedIdentifier))
                            .findFirst();
                });
    }

    private String normalizePhone(String phone) {
        if (phone == null) {
            return "";
        }

        String digits = phone.replaceAll("\\D", "");
        if (digits.startsWith("91") && digits.length() == 12) {
            return digits.substring(2);
        }
        return digits;
    }
}
