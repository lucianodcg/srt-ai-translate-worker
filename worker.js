addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

// Main request handler
async function handleRequest(request) {
    try {
        if (request.method === 'GET') {
            // Serve the HTML form with translation UI
            return new Response(htmlForm(), {
                headers: { 'Content-Type': 'text/html' }
            });
        } else {
            return new Response('Method not allowed', { status: 405 });
        }
    } catch (error) {
        return new Response(`Error: ${error.message}`, { status: 500 });
    }
}

// HTML form with translation UI and progress bar
function htmlForm() {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SRT Translator to Any Language (Gemini)</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1e1e2f, #2a2a40);
            color: #e0e0e0;
            line-height: 1.6;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }

        .container {
            background: rgba(40, 40, 60, 0.9);
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            max-width: 600px;
            width: 100%;
            margin: 0 auto;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        h1 {
            font-size: 2rem;
            margin-bottom: 1.5rem;
            color: #ffffff;
            text-align: center;
            font-weight: 600;
        }

        p {
            margin-bottom: 1.5rem;
            text-align: center;
            color: #cccccc;
        }

        form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        label {
            font-weight: bold;
            margin-bottom: 0.5rem;
            color: #ffffff;
        }

        input[type="file"],
        input[type="text"],
        input[type="password"],
        input[type="number"] {
            padding: 0.75rem;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            font-size: 1rem;
            width: 100%;
            background: rgba(255, 255, 255, 0.1);
            color: #e0e0e0;
            transition: border-color 0.3s ease, background 0.3s ease;
        }

        input[type="file"] {
            cursor: pointer;
        }

        input[type="text"]:focus,
        input[type="password"]:focus {
            border-color: #007bff;
            background: rgba(255, 255, 255, 0.15);
            outline: none;
        }

        .api-key-container {
            position: relative;
            display: flex;
            align-items: center;
        }

        .api-key-container input {
            padding-right: 40px;
        }

        .toggle-password {
            position: absolute;
            right: 10px;
            background: none;
            border: none;
            cursor: pointer;
            color: #cccccc;
            font-size: 1.2rem;
            transition: color 0.3s ease;
        }

        .toggle-password:hover {
            color: #007bff;
        }

        .remember-me {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }

        .remember-me input {
            margin: 0;
        }

        .remember-me label {
            color: #cccccc;
        }

        button {
            padding: 0.75rem;
            background: linear-gradient(135deg, #007bff, #0056b3);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            transition: background 0.3s ease, transform 0.2s ease;
        }

        button:hover {
            background: linear-gradient(135deg, #0056b3, #007bff);
            transform: translateY(-2px);
        }

        button:active {
            transform: translateY(0);
        }

        .progress-container {
            margin-top: 1rem;
            display: none;
        }

        .progress-bar {
            width: 100%;
            height: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            overflow: hidden;
        }

        .progress {
            height: 100%;
            background: linear-gradient(135deg, #007bff, #0056b3);
            width: 0;
            transition: width 0.3s ease;
        }

        .progress-text {
            text-align: center;
            margin-top: 0.5rem;
            color: #cccccc;
        }

        .download-link {
            margin-top: 1rem;
            text-align: center;
            display: none;
        }

        .download-link a {
            color: #007bff;
            text-decoration: none;
            font-weight: bold;
        }

        .download-link a:hover {
            text-decoration: underline;
        }

        .error-message {
            color: #ff4444;
            text-align: center;
            margin-top: 1rem;
            display: none;
            font-size: 0.9rem;
            word-wrap: break-word;
        }

        .api-key-note {
            font-size: 0.875rem;
            color: #999999;
            text-align: center;
            margin-top: 1rem;
        }

        .api-key-note a {
            color: #007bff;
            text-decoration: none;
            transition: color 0.3s ease;
        }

        .api-key-note a:hover {
            color: #0056b3;
            text-decoration: underline;
        }

        @media (max-width: 768px) {
            h1 {
                font-size: 1.75rem;
            }

            .container {
                padding: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>SRT Translator to to Any Language</h1>
        <p style="color: #ff4444; font-weight: bold;">⚠️ Please use a VPN to access the Gemini API, as Iran is currently under sanctions.</p>
        <p>Upload an SRT file and provide your Gemini API key to translate the text to to Any Language.</p>
        <form id="translate-form" onsubmit="return handleTranslate(event)">
            <label for="file">Upload SRT File:</label>
            <input type="file" id="file" name="file" accept=".srt" required>
            <label for="api_key">Gemini API Key:</label>
            <div class="api-key-container">
                <input type="password" id="api_key" name="api_key" placeholder="Enter your Gemini API key" required>
                <button type="button" class="toggle-password" onclick="togglePasswordVisibility()">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
            <div class="remember-me">
                <input type="checkbox" id="remember_me" name="remember_me">
                <label for="remember_me">Remember my API key</label>
            </div>
            <label for="base_delay">Base Delay (ms):</label>
            <input type="number" id="base_delay" name="base_delay" min="100" value="4000" placeholder="Base delay in milliseconds" required>
            <label for="quota_delay">Quota Delay (ms):</label>
            <input type="number" id="quota_delay" name="quota_delay" min="1000" value="60000" placeholder="Quota delay in milliseconds" required>
            <label for="lang">Language:</label>
            <input type="text" id="lang" name="lang" value="Persian (Farsi)" placeholder="Language:">
            <button type="submit">Translate</button>
        </form>
        <div class="progress-container" id="progress-container">
            <div class="progress-bar">
                <div class="progress" id="progress"></div>
            </div>
            <div class="progress-text" id="progress-text">0% Complete</div>
        </div>
        <div class="download-link" id="download-link"></div>
        <div class="error-message" id="error-message"></div>
        <p class="api-key-note">Get your API key from <a href="https://aistudio.google.com/" target="_blank">Google AI Studio</a>.</p>
    </div>

    <script>
        function togglePasswordVisibility() {
            const apiKeyInput = document.getElementById('api_key');
            const toggleButton = document.querySelector('.toggle-password i');
            if (apiKeyInput.type === 'password') {
                apiKeyInput.type = 'text';
                toggleButton.classList.remove('fa-eye');
                toggleButton.classList.add('fa-eye-slash');
            } else {
                apiKeyInput.type = 'password';
                toggleButton.classList.remove('fa-eye-slash');
                toggleButton.classList.add('fa-eye');
            }
        }

        function saveApiKey() {
            const apiKeyInput = document.getElementById('api_key');
            const rememberMeCheckbox = document.getElementById('remember_me');
            if (rememberMeCheckbox.checked && apiKeyInput.value) {
                localStorage.setItem('savedApiKey', apiKeyInput.value);
            } else {
                localStorage.removeItem('savedApiKey');
            }
        }

        function loadApiKey() {
            const apiKeyInput = document.getElementById('api_key');
            const rememberMeCheckbox = document.getElementById('remember_me');
            const savedApiKey = localStorage.getItem('savedApiKey');
            if (savedApiKey) {
                apiKeyInput.value = savedApiKey;
                rememberMeCheckbox.checked = true;
            }
        }

        window.addEventListener('load', loadApiKey);

        function parseSRT(srtContent) {
            const entries = srtContent.trim().split('\\n\\n');
            const parsedEntries = [];
            for (const entry of entries) {
                const lines = entry.split('\\n');
                if (lines.length < 3) {
                    console.warn(\`Skipping malformed entry: \${entry}\`);
                    continue;
                }
                const id = lines[0];
                const timeStamp = lines[1];
                const text = lines.slice(2).join('\\n');
                parsedEntries.push({ id, timeStamp, text });
            }
            return parsedEntries;
        }

        async function translateText(text, apiKey, baseDelay, quotaDelay, lang) {
            const url = \`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=\${apiKey}\`;
            const headers = { 'Content-Type': 'application/json' };
            const payload = {
                contents: [{
                    parts: [{
                        text: \`Translate the following text to \`+lang+\`. Return only the translated text, nothing else:\\n\\n\${text}\`
                    }]
                }]
            };

            let attempts = 0;
            const maxAttempts = 5;

            while (attempts < maxAttempts) {
                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                        if (response.status === 503) {
                            throw new Error('Service unavailable (503) - Retrying...');
                        } else if (response.status === 429) {
                            throw new Error('Quota exceeded (429) - Retrying...');
                        }
                        throw new Error(\`Gemini API error: \${response.status} - \${response.statusText}\`);
                    }

                    const data = await response.json();
                    if (!data.candidates || !data.candidates[0].content || !data.candidates[0].content.parts[0].text) {
                        throw new Error('Invalid response from Gemini API - Ensure your API key is valid');
                    }

                    await new Promise(resolve => setTimeout(resolve, baseDelay));
                    return data.candidates[0].content.parts[0].text.trim();
                } catch (error) {
                    attempts++;
                    if (attempts < maxAttempts) {
                        let delay;
                        if (error.message.includes('503')) {
                            delay = Math.pow(2, attempts) * baseDelay;
                            console.log(\`Retry attempt \${attempts} for 503: Waiting \${delay / 1000}s\`);
                        } else if (error.message.includes('429')) {
                            delay = quotaDelay;
                            console.log(\`Retry attempt \${attempts} for 429: Waiting \${delay / 1000}s\`);
                            throw new Error(\`Quota exceeded. Waiting \${delay / 1000} seconds before retrying...\`);
                        } else {
                            throw error;
                        }
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }
                    throw error;
                }
            }
            throw new Error('Max retry attempts reached');
        }

        function reconstructSRT(entries) {
            let srtContent = '';
            for (const entry of entries) {
                srtContent += \`\${entry.id}\\n\${entry.timeStamp}\\n\${entry.text}\\n\\n\`;
            }
            return srtContent.trim();
        }

        async function handleTranslate(event) {
            event.preventDefault();

            const fileInput = document.getElementById('file');
            const apiKey = document.getElementById('api_key').value;
            const lang = document.getElementById('lang').value;
            const baseDelay = parseInt(document.getElementById('base_delay').value, 10);
            const quotaDelay = parseInt(document.getElementById('quota_delay').value, 10);
            const progressContainer = document.getElementById('progress-container');
            const progressBar = document.getElementById('progress');
            const progressText = document.getElementById('progress-text');
            const downloadLink = document.getElementById('download-link');
            const errorMessage = document.getElementById('error-message');
            const submitButton = document.querySelector('button[type="submit"]');

            // Validate inputs
            if (isNaN(baseDelay) || baseDelay < 100) {
                errorMessage.textContent = 'Base delay must be at least 100ms.';
                errorMessage.style.display = 'block';
                return false;
            }
            if (isNaN(quotaDelay) || quotaDelay < 1000) {
                errorMessage.textContent = 'Quota delay must be at least 1000ms.';
                errorMessage.style.display = 'block';
                return false;
            }
            if (!fileInput.files[0]) {
                errorMessage.textContent = 'Please upload an SRT file.';
                errorMessage.style.display = 'block';
                return false;
            }

            // Reset UI
            progressContainer.style.display = 'none';
            downloadLink.style.display = 'none';
            errorMessage.style.display = 'none';
            submitButton.disabled = true;

            try {
                const file = fileInput.files[0];
                const srtContent = await file.text();
                const parsedEntries = parseSRT(srtContent);
                const totalEntries = parsedEntries.length;
                let completed = 0;
                const translatedEntries = [];
                const failedEntries = [];

                progressContainer.style.display = 'block';

                for (const entry of parsedEntries) {
                    let retrying = false;
                    try {
                        console.log(\`Translating entry \${entry.id}\`);
                        const translatedText = await translateText(entry.text, apiKey, baseDelay, quotaDelay, lang);
                        translatedEntries.push({ id: entry.id, timeStamp: entry.timeStamp, text: translatedText });
                        console.log(\`Successfully translated entry \${entry.id}\`);
                    } catch (error) {
                        console.error(\`Error on entry \${entry.id}: \${error.message}\`);
                        if (error.message.includes('Quota exceeded. Waiting')) {
                            retrying = true;
                            const waitTime = quotaDelay / 1000;
                            let remainingTime = waitTime;
                            progressText.textContent = \`Quota exceeded. Retrying in \${remainingTime}s...\`;
                            const countdown = setInterval(() => {
                                remainingTime--;
                                progressText.textContent = \`Quota exceeded. Retrying in \${remainingTime}s...\`;
                                if (remainingTime <= 0) clearInterval(countdown);
                            }, 1000);
                            await new Promise(resolve => setTimeout(resolve, quotaDelay));
                            const translatedText = await translateText(entry.text, apiKey, baseDelay, quotaDelay);
                            translatedEntries.push({ id: entry.id, timeStamp: entry.timeStamp, text: translatedText });
                        } else {
                            failedEntries.push({ id: entry.id, reason: error.message });
                            errorMessage.textContent = \`Failed entry \${entry.id}: \${error.message}. Continuing...\`;
                            errorMessage.style.display = 'block';
                            continue;
                        }
                    }
                    if (!retrying) {
                        completed++;
                        const percentage = Math.round((completed / totalEntries) * 100);
                        progressBar.style.width = \`\${percentage}%\`;
                        progressText.textContent = \`\${percentage}% Complete\`;
                    }
                }

                const translatedSRT = reconstructSRT(translatedEntries);
                const blob = new Blob([translatedSRT], { type: 'application/octet-stream' });
                const url = URL.createObjectURL(blob);
                downloadLink.innerHTML = \`<a href="\${url}" download="translated.srt">Download Translated SRT (\${translatedEntries.length} of \${totalEntries} translated)</a>\`;
                downloadLink.style.display = 'block';

                if (failedEntries.length > 0) {
                    errorMessage.textContent = \`Translated \${translatedEntries.length} of \${totalEntries} entries. Failed: \${failedEntries.map(e => \`Entry \${e.id} - \${e.reason}\`).join(', ')}\`;
                    errorMessage.style.display = 'block';
                } else {
                    errorMessage.textContent = 'All entries translated successfully!';
                    errorMessage.style.color = '#44ff44'; // Green for success
                    errorMessage.style.display = 'block';
                }

                saveApiKey();
            } catch (error) {
                errorMessage.textContent = \`Unexpected error: \${error.message}\`;
                errorMessage.style.display = 'block';
            } finally {
                submitButton.disabled = false;
            }

            return false;
        }
    </script>
</body>
</html>
    `;
}
