/* =========================================
   HELPNearby - MAIN JAVASCRIPT
========================================= */


/* =========================================
   GET CURRENT LOCATION
========================================= */

const locationButton = document.querySelector(".location-box button");
const locationInput = document.querySelector("#location");

if (locationButton && locationInput) {

    locationButton.addEventListener("click", function () {

        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        locationButton.textContent = "Getting Location...";
        locationButton.disabled = true;

        navigator.geolocation.getCurrentPosition(

            function (position) {

                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                locationInput.value =
                    "Latitude: " + latitude +
                    ", Longitude: " + longitude;

                locationButton.textContent = "Location Added";
                locationButton.disabled = false;
            },

            function () {

                alert(
                    "Unable to get your location. Please allow location permission."
                );

                locationButton.textContent = "Get Location";
                locationButton.disabled = false;
            }

        );

    });

}


/* =========================================
   REQUEST HELP FORM
========================================= */

const helpForm = document.querySelector(".help-form");

if (helpForm) {
    helpForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = helpForm.querySelector("#name")?.value.trim();
        const phone = helpForm.querySelector("#phone")?.value.trim();
        const emergency = helpForm.querySelector("#emergency")?.value;

        if (!name || !phone || !emergency) {
            alert("Please complete the required fields.");
            return;
        }

        alert("Your emergency request has been submitted.");
        helpForm.reset();
    });
}

const emergencyForm = document.querySelector(".emergency-form");

if (emergencyForm) {
    emergencyForm.addEventListener("submit", function (event) {
        event.preventDefault();
        alert("Your emergency request has been submitted.");
    });
}

const fileInput = document.querySelector("#photo");
const fileName = document.querySelector(".file-picker em");

if (fileInput && fileName) {
    fileInput.addEventListener("change", function () {
        fileName.textContent = fileInput.files[0]?.name || "No file chosen";
    });
}

const contactForm = document.querySelector(".contact-form");

if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();
        alert("Thank you. Your message has been sent.");
        contactForm.reset();
    });
}

const loginForm = document.querySelector(".login-container form");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const identifierInput = document.querySelector("#identifier");
        const passwordInput = document.querySelector("#password");

        if (!identifierInput || !passwordInput) {
            alert("Please fill in the form correctly.");
            return;
        }

        const payload = {
            identifier: identifierInput.value.trim(),
            password: passwordInput.value
        };

        try {
            const response = await fetch("http://localhost:8091/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                const message = data?.message || data?.email || "Login failed.";
                alert(message);
                return;
            }

            localStorage.setItem("helpnearbyUser", JSON.stringify({
                email: data.email,
                role: data.role
            }));

            alert("Login successful.");

            if (data.role === "ADMIN") {
                window.location.href = "admin-dashboard.html";
            } else if (data.role === "VOLUNTEER") {
                window.location.href = "volunteer-dashboard.html";
            } else {
                window.location.href = "dashboard.html";
            }
        } catch (error) {
            alert("Unable to connect to the backend server.");
            console.error(error);
        }
    });
}

const registerForm = document.querySelector(".register-container form");

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const nameInput = document.querySelector("#name");
        const emailInput = document.querySelector("#email");
        const phoneInput = document.querySelector("#phone");
        const passwordInput = document.querySelector("#password");
        const roleInput = document.querySelector('input[name="role"]:checked');

        if (!nameInput || !emailInput || !phoneInput || !passwordInput || !roleInput) {
            alert("Please complete all fields.");
            return;
        }

        const payload = {
            fullName: nameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            password: passwordInput.value,
            role: roleInput.value.toUpperCase()
        };

        try {
            const response = await fetch("http://localhost:8091/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                const message = data?.message || Object.values(data || {})[0] || "Registration failed.";
                alert(message);
                return;
            }

            alert("Your account has been created successfully.");
            window.location.href = "login.html";
        } catch (error) {
            alert("Unable to connect to the backend server.");
            console.error(error);
        }
    });
}

const createEmergencyForm = document.querySelector(".create-emergency-form");

if (createEmergencyForm) {
    createEmergencyForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const payload = {
            requesterEmail: document.querySelector("#requesterEmail").value.trim(),
            category: document.querySelector("#category").value,
            description: document.querySelector("#description").value.trim(),
            location: document.querySelector("#location").value.trim(),
            priority: document.querySelector("#priority").value
        };

        try {
            const response = await fetch("http://localhost:8091/api/emergency-requests", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data?.message || Object.values(data || {})[0] || "Request could not be created.");
                return;
            }

            alert(`Emergency request created. Request ID: #${data.id}`);
            createEmergencyForm.reset();
        } catch (error) {
            alert("Unable to connect to the backend server.");
            console.error(error);
        }
    });
}

const volunteerRequestsPanel = document.querySelector("[data-volunteer-requests]");

if (volunteerRequestsPanel) {
    loadVolunteerRequests(volunteerRequestsPanel);
}

async function loadVolunteerRequests(panel) {
    try {
        const response = await fetch("http://localhost:8091/api/emergency-requests?status=PENDING");
        const requests = await response.json();

        if (!response.ok || !Array.isArray(requests)) {
            throw new Error("Could not load requests");
        }

        if (requests.length === 0) {
            panel.querySelector("[data-request-message]").textContent = "No pending emergency requests.";
            return;
        }

        panel.querySelector("[data-request-message]")?.remove();
        requests.forEach((request) => {
            const row = document.createElement("article");
            row.className = "nearby-request-row";
            row.innerHTML = `
                <span class="nearby-request-icon medical-request">+</span>
                <div class="nearby-request-details">
                    <div><strong>${escapeHtml(request.category)}</strong><span class="priority-badge ${request.priority.toLowerCase()}-badge">${escapeHtml(request.priority)}</span></div>
                    <small>${escapeHtml(request.location)} <span class="separator-icon"></span> Request #${request.id}</small>
                </div>
                <button class="accept-button" type="button" data-accept-request="${request.id}">Accept</button>`;
            panel.appendChild(row);
        });

        panel.addEventListener("click", acceptVolunteerRequest);
    } catch (error) {
        const message = panel.querySelector("[data-request-message]");
        if (message) {
            message.textContent = "Unable to load emergency requests.";
        }
        console.error(error);
    }
}

async function acceptVolunteerRequest(event) {
    const button = event.target.closest("[data-accept-request]");
    if (!button) {
        return;
    }

    button.disabled = true;
    const requestId = button.dataset.acceptRequest;

    try {
        const response = await fetch(`http://localhost:8091/api/emergency-requests/${requestId}/accept`, {
            method: "PATCH"
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.message || "Request could not be accepted");
        }

        button.closest(".nearby-request-row")?.remove();
        alert("Emergency request accepted successfully.");
    } catch (error) {
        button.disabled = false;
        alert(error.message);
    }
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}