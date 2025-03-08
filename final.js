// const apiKey = "AIzaSyAC5U1_HDwL5JEhXbm2QVe7Ghnp2VV8gx4"; // Replace with your Google API key

// Function to handle translation from any input
function translateText(text) {
    if (!text.trim()) {
        alert("No input provided for translation.");
        return;
    }

    const sourceLang = document.getElementById("sourceLanguage").value;
    const targetLang = document.getElementById("targetLanguage").value;

    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            q: text,
            source: sourceLang === "auto" ? undefined : sourceLang,
            target: targetLang,
            format: "text"
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.data && data.data.translations) {
            document.getElementById("translationOutput").innerHTML = `<p>${data.data.translations[0].translatedText}</p>`;
        } else {
            document.getElementById("translationOutput").innerHTML = "<p>Error: Translation failed.</p>";
        }
    })
    .catch(error => {
        console.error("Translation error:", error);
        document.getElementById("translationOutput").innerHTML = "<p>Translation failed. Try again.</p>";
    });
}

// Handle text translation
document.getElementById("translateButton").addEventListener("click", function () {
    const sourceText = document.getElementById("sourceText").value;
    translateText(sourceText);
});

// Handle file upload translation (TXT only)
document.getElementById("uploadButton").addEventListener("click", function () {
    const file = document.getElementById("fileUpload").files[0];
    if (!file) {
        alert("Please upload a file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        translateText(event.target.result);
    };
    reader.readAsText(file);
});

// Handle speech recognition
const speechRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
if (speechRecognition) {
    document.getElementById("speechButton").addEventListener("click", () => {
        speechRecognition.start();
    });

    speechRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById("sourceText").value = transcript;
        translateText(transcript);
    };
}

// Handle image upload for OCR and translation
document.getElementById("imageUploadButton").addEventListener("click", function () {
    const file = document.getElementById("imageUpload").files[0];
    if (!file) {
        alert("Please upload an image (JPG or JPEG).");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        const base64Image = event.target.result.split(',')[1]; // Convert image to Base64 format
        extractTextFromImage(base64Image);
    };
    reader.readAsDataURL(file);
});

// Function to extract text from image using Google Vision API
function extractTextFromImage(base64Image) {
    const visionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

    fetch(visionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            requests: [
                {
                    image: { content: base64Image },
                    features: [{ type: "TEXT_DETECTION" }]
                }
            ]
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.responses && data.responses[0].textAnnotations) {
            const extractedText = data.responses[0].textAnnotations[0].description;
            translateText(extractedText); // Translate the extracted text
        } else {
            alert("No text found in image.");
        }
    })
    .catch(error => {
        console.error("OCR error:", error);
        alert("Failed to extract text from image.");
    });
}
