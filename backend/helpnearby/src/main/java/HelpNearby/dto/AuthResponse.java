package HelpNearby.dto;

public class AuthResponse {
    private String message;
    private String role;
    private String email;

    public AuthResponse(String message, String role, String email) {
        this.message = message;
        this.role = role;
        this.email = email;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
