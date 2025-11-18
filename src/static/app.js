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

      // Reset activity select (keep placeholder)
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Helper to get initials from a participant string (name or email)
      function getInitials(str) {
        if (!str) return '';
        // If contains a space, try to use first letters of first two words (name)
        const words = str.trim().split(/\s+/);
        if (words.length >= 2) {
          return (words[0][0] + words[1][0]).toUpperCase();
        }
        // Otherwise use local-part of email or first two characters
        const local = str.split('@')[0] || str;
        return local.slice(0, 2).toUpperCase();
      }

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - (details.participants ? details.participants.length : 0);

        // Title
        const title = document.createElement('h4');
        title.textContent = name;
        activityCard.appendChild(title);

        // Description
        const desc = document.createElement('p');
        desc.textContent = details.description || '';
        activityCard.appendChild(desc);

        // Schedule
        const schedule = document.createElement('p');
        schedule.innerHTML = `<strong>Schedule:</strong> ${details.schedule || 'TBA'}`;
        activityCard.appendChild(schedule);

        // Availability
        const avail = document.createElement('p');
        avail.innerHTML = `<strong>Availability:</strong> ${spotsLeft} spots left`;
        activityCard.appendChild(avail);

        // Participants section
        const participantsWrap = document.createElement('div');
        participantsWrap.className = 'participants';

        const participantsTitle = document.createElement('strong');
        participantsTitle.textContent = 'Participants:';
        participantsWrap.appendChild(participantsTitle);

        const ul = document.createElement('ul');
        ul.className = 'participants-list';

        if (details.participants && details.participants.length > 0) {
          details.participants.forEach((p) => {
            const li = document.createElement('li');
            li.className = 'participant-item';

            const avatar = document.createElement('span');
            avatar.className = 'avatar';
            avatar.textContent = getInitials(p);

            const text = document.createElement('span');
            text.textContent = p;

            li.appendChild(avatar);
            li.appendChild(text);
            ul.appendChild(li);
          });
        } else {
          const li = document.createElement('li');
          li.className = 'no-participants';
          li.textContent = 'No participants yet';
          ul.appendChild(li);
        }

        participantsWrap.appendChild(ul);
        activityCard.appendChild(participantsWrap);

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
