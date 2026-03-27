document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <strong>Participants:</strong>
          </div>
        `;

        const participantsSection = activityCard.querySelector(".participants-section");

        if (details.participants.length > 0) {
          const ul = document.createElement("ul");
          ul.className = "participants-list";

          details.participants.forEach((email) => {
            const li = document.createElement("li");
            li.className = "participant-item";

            const emailSpan = document.createElement("span");
            emailSpan.textContent = email;

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-participant-btn";
            deleteBtn.title = `Unregister ${email}`;
            deleteBtn.innerHTML = "&#x1F5D1;";

            deleteBtn.addEventListener("click", async () => {
              try {
                const response = await fetch(
                  `/activities/${encodeURIComponent(name)}/signup?email=${encodeURIComponent(email)}`,
                  { method: "DELETE" }
                );
                if (response.ok) {
                  li.remove();
                  if (ul.children.length === 0) {
                    ul.remove();
                    const empty = document.createElement("p");
                    empty.className = "no-participants";
                    empty.textContent = "No participants yet. Be the first!";
                    participantsSection.appendChild(empty);
                  }
                } else {
                  const err = await response.json();
                  alert(err.detail || "Failed to unregister participant.");
                }
              } catch (error) {
                console.error("Error unregistering participant:", error);
              }
            });

            li.appendChild(emailSpan);
            li.appendChild(deleteBtn);
            ul.appendChild(li);
          });

          participantsSection.appendChild(ul);
        } else {
          const empty = document.createElement("p");
          empty.className = "no-participants";
          empty.textContent = "No participants yet. Be the first!";
          participantsSection.appendChild(empty);
        }

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
