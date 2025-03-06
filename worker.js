// Cloudflare Worker script to translate SRT files to Persian using a user-provided Gemini API key

// Add an event listener to handle incoming fetch requests
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

// Main request handler function
async function handleRequest(request) {
    try {
        // Check the request method
        if (request.method === 'GET') {
            // Serve the HTML form for uploading SRT files and entering the API key
            return new Response(htmlForm(), {
                headers: { 'Content-Type': 'text/html' }
            });
        } else if (request.method === 'POST') {
            // Handle the SRT file upload and translation
            const formData = await request.formData();
            const file = formData.get('file'); // Get the uploaded SRT file
            const apiKey = formData.get('api_key'); // Get the user-provided API key

            // Validate inputs
            if (!file) {
                return new Response('Missing required field: file', { status: 400 });
            }
            if (!apiKey) {
                return new Response('Missing required field: API key', { status: 400 });
            }

            // Read the uploaded SRT file content
            const srtContent = await file.text();

            // Parse the SRT content into individual entries
            const parsedEntries = parseSRT(srtContent);

            // Translate each entry's text to Persian using the Gemini API
            const translatedEntries = [];
            for (const entry of parsedEntries) {
                const translatedText = await translateText(entry.text, apiKey);
                translatedEntries.push({ id: entry.id, timeStamp: entry.timeStamp, text: translatedText });
            }

            // Reconstruct the translated SRT file from the translated entries
            const translatedSRT = reconstructSRT(translatedEntries);

            // Return the translated SRT file as a downloadable response
            return new Response(translatedSRT, {
                headers: {
                    'Content-Type': 'application/octet-stream',
                    'Content-Disposition': 'attachment; filename="translated.srt"'
                }
            });
        } else {
            // Return an error for unsupported HTTP methods
            return new Response('Method not allowed', { status: 405 });
        }
    } catch (error) {
        // Handle any errors and return a 500 status with the error message
        return new Response(`Error: ${error.message}`, { status: 500 });
    }
}

// Function to generate the HTML form for file upload and API key input
function htmlForm() {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SRT Translator to Persian (Gemini)</title>
    <!-- Load Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        /* General Reset */
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
        input[type="password"] {
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
            padding-right: 40px; /* Space for the eye button */
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

        /* Responsive Design */
        @media (max-width: 768px) {
            h1 {
                font-size: 1.75rem;
            }

            .container {
                padding: 1.5rem;
            }

            input[type="file"],
            input[type="text"],
            input[type="password"] {
                padding: 0.5rem;
                font-size: 0.9rem;
            }

            button {
                padding: 0.5rem;
                font-size: 0.9rem;
            }
        }

        @media (max-width: 480px) {
            h1 {
                font-size: 1.5rem;
            }

            .container {
                padding: 1rem;
            }

            input[type="file"],
            input[type="text"],
            input[type="password"] {
                padding: 0.4rem;
                font-size: 0.85rem;
            }

            button {
                padding: 0.4rem;
                font-size: 0.85rem;
            }

            .api-key-note {
                font-size: 0.8rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>SRT Translator to Persian</h1>
        <p>Upload an SRT file and provide your Gemini API key to translate the text to Persian (Farsi).</p>
        <form action="/translate" method="post" enctype="multipart/form-data">
            <label for="file">Upload SRT File:</label>
            <input type="file" id="file" name="file" accept=".srt" required>
            <label for="api_key">Gemini API Key:</label>
            <div class="api-key-container">
                <input type="password" id="api_key" name="api_key" placeholder="Enter your Gemini API key" required>
                <button type="button" class="toggle-password" onclick="togglePasswordVisibility()">
                    <i class="fas fa-eye"></i> <!-- Font Awesome eye icon -->
                </button>
            </div>
            <div class="remember-me">
                <input type="checkbox" id="remember_me" name="remember_me">
                <label for="remember_me">Remember my API key</label>
            </div>
            <button type="submit">Translate to Persian</button>
        </form>
        <p class="api-key-note">Get your API key from <a href="https://aistudio.google.com/" target="_blank">Google AI Studio</a>.</p>
    </div>

    <script>
        // Function to toggle password visibility
        function togglePasswordVisibility() {
            const apiKeyInput = document.getElementById('api_key');
            const toggleButton = document.querySelector('.toggle-password i');

            if (apiKeyInput.type === 'password') {
                apiKeyInput.type = 'text';
                toggleButton.classList.remove('fa-eye');
                toggleButton.classList.add('fa-eye-slash'); // Change to "eye-slash" icon
            } else {
                apiKeyInput.type = 'password';
                toggleButton.classList.remove('fa-eye-slash');
                toggleButton.classList.add('fa-eye'); // Change back to "eye" icon
            }
        }

        // Function to save API key to localStorage
        function saveApiKey() {
            const apiKeyInput = document.getElementById('api_key');
            const rememberMeCheckbox = document.getElementById('remember_me');

            if (rememberMeCheckbox.checked && apiKeyInput.value) {
                localStorage.setItem('savedApiKey', apiKeyInput.value); // Save API key
            } else {
                localStorage.removeItem('savedApiKey'); // Remove API key if checkbox is unchecked
            }
        }

        // Function to load saved API key from localStorage
        function loadApiKey() {
            const apiKeyInput = document.getElementById('api_key');
            const rememberMeCheckbox = document.getElementById('remember_me');
            const savedApiKey = localStorage.getItem('savedApiKey');

            if (savedApiKey) {
                apiKeyInput.value = savedApiKey; // Populate the API key field
                rememberMeCheckbox.checked = true; // Check the "Remember me" checkbox
            }
        }

        // Load saved API key when the page loads
        window.addEventListener('load', loadApiKey);

        // Save API key when the form is submitted
        document.querySelector('form').addEventListener('submit', saveApiKey);
    </script>
</body>
</html>
    `;
}

// Function to parse SRT content into an array of entries
function parseSRT(srtContent) {
    const entries = srtContent.trim().split('\n\n');
    const parsedEntries = [];
    for (const entry of entries) {
        const lines = entry.split('\n');
        if (lines.length < 3) continue; // Skip invalid entries
        const id = lines[0];
        const timeStamp = lines[1];
        const text = lines.slice(2).join('\n');
        parsedEntries.push({ id, timeStamp, text });
    }
    return parsedEntries;
}

// Function to translate text to Persian using the Gemini API
async function translateText(text, apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const headers = {
        'Content-Type': 'application/json'
    };
    const payload = {
        contents: [{
            parts: [{
                text: `Translate the following text to Persian (Farsi). Return only the translated text, nothing else:\n\n${text}`
            }]
        }]
    };

    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText} - Check your API key or usage limits`);
    }

    const data = await response.json();
    if (!data.candidates || !data.candidates[0].content || !data.candidates[0].content.parts[0].text) {
        throw new Error('Invalid response from Gemini API - Ensure your API key is valid');
    }

    return data.candidates[0].content.parts[0].text.trim();
}

// Function to reconstruct SRT content from translated entries
function reconstructSRT(entries) {
    let srtContent = '';
    for (const entry of entries) {
        srtContent += `${entry.id}\n${entry.timeStamp}\n${entry.text}\n\n`;
    }
    return srtContent.trim();
}
