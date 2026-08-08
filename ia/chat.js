const messagesEl = document.getElementById("messages");
const form = document.getElementById("messageForm");
const input = document.getElementById("messageInput");
const pill = document.getElementById("userPill");

let lastSignature = "";

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function render(messages) {
  const signature = messages.map(m => `${m.id}:${m.content}`).join("|");
  if (signature === lastSignature) return;
  lastSignature = signature;

  messagesEl.innerHTML = messages.map(m => `
    <article class="message ${m.sender}">
      ${escapeHtml(m.content)}
      <span class="meta">${m.sender === "admin" ? "Réponse" : "Vous"}</span>
    </article>
  `).join("");
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function refresh() {
  const res = await fetch("/api/me");
  if (res.status === 401) return location.href = "/";
  const data = await res.json();
  pill.textContent = `${data.user.first_name} ${data.user.last_name}`;
  render(data.messages);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const content = input.value.trim();
  if (!content) return;
  input.value = "";

  const res = await fetch("/api/messages", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({content})
  });

  if (!res.ok) {
    const data = await res.json();
    alert(data.error || "Impossible d'envoyer le message.");
  }
  refresh();
});

refresh();
setInterval(refresh, 2000);
