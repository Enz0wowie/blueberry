document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const webhookUrl = document.getElementById('webhook-url');
    const username = document.getElementById('username');
    const avatarUrl = document.getElementById('avatar-url');
    const avatarPreview = document.getElementById('avatar-preview');
    const message = document.getElementById('message');
    const spamCount = document.getElementById('spam-count');
    const delay = document.getElementById('delay');
    const sendBtn = document.getElementById('send-btn');
    const spamBtn = document.getElementById('spam-btn');
    const logs = document.getElementById('logs');
    const clearLogsBtn = document.getElementById('clear-logs-btn');

    // Avatar preview
    avatarUrl.addEventListener('input', function() {
        if (avatarUrl.value) {
            avatarPreview.src = avatarUrl.value;
            avatarPreview.style.display = 'block';
        } else {
            avatarPreview.style.display = 'none';
        }
    });

    // Add log entry
    function addLog(text, isError = false) {
        const now = new Date();
        const timeString = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;

        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';

        const timeSpan = document.createElement('span');
        timeSpan.className = 'log-time';
        timeSpan.textContent = timeString;

        const textSpan = document.createElement('span');
        textSpan.className = isError ? 'log-error' : 'log-success';
        textSpan.textContent = text;

        logEntry.appendChild(timeSpan);
        logEntry.appendChild(textSpan);
        logs.appendChild(logEntry);
        logs.scrollTop = logs.scrollHeight;
    }

    // Send webhook message
    async function sendWebhook() {
        if (!webhookUrl.value) {
            addLog('Error: Webhook URL is required', true);
            return;
        }
        if (!message.value) {
            addLog('Error: Message content is required', true);
            return;
        }

        const payload = {
            content: message.value,
            username: username.value || 'Webhook',
            avatar_url: avatarUrl.value || null
        };

        try {
            const response = await fetch(webhookUrl.value, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                addLog('Message sent successfully');
            } else {
                addLog(`Error: ${response.status} ${response.statusText}`, true);
            }
        } catch (error) {
            addLog(`Error: ${error.message}`, true);
        }
    }

    // Spam webhook messages
    let isSpamming = false;
    let spamInterval;

    async function spamWebhook() {
        if (isSpamming) {
            // Stop spamming
            clearInterval(spamInterval);
            isSpamming = false;
            spamBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M13 14h-2v-4h2v4zm0-6h-2V6h2v2zm10-4v16H1V4h4V2h2v2h8V2h2v2h4zM3 18h16V8H3v10z"/>
                </svg> Start Spam
            `;
            addLog('Spamming stopped');
            return;
        }

        if (!webhookUrl.value) {
            addLog('Error: Webhook URL is required', true);
            return;
        }
        if (!message.value) {
            addLog('Error: Message content is required', true);
            return;
        }

        const count = parseInt(spamCount.value) || 1;
        const delayMs = parseInt(delay.value) || 1000;

        if (count < 1 || count > 20) {
            addLog('Error: Spam count must be between 1 and 20', true);
            return;
        }
        if (delayMs < 0 || delayMs > 10000) {
            addLog('Error: Delay must be between 0 and 10000 ms', true);
            return;
        }

        isSpamming = true;
        spamBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M6 6h12v12H6z"/>
            </svg> Stop Spam
        `;
        addLog(`Started spamming ${count} messages with ${delayMs}ms delay`);

        let sent = 0;
        spamInterval = setInterval(async () => {
            if (sent >= count) {
                clearInterval(spamInterval);
                isSpamming = false;
                spamBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                        <path d="M13 14h-2v-4h2v4zm0-6h-2V6h2v2zm10-4v16H1V4h4V2h2v2h8V2h2v2h4zM3 18h16V8H3v10z"/>
                    </svg> Start Spam
                `;
                addLog('Spamming completed');
                return;
            }
            await sendWebhook();
            sent++;
        }, delayMs);
    }

    // Event listeners
    sendBtn.addEventListener('click', sendWebhook);
    spamBtn.addEventListener('click', spamWebhook);
    clearLogsBtn.addEventListener('click', function() {
        logs.innerHTML = '';
        addLog('Logs cleared');
    });

    // Initialize placeholder
    webhookUrl.placeholder = 'https://discord.com/api/webhooks/123/abc';
});
