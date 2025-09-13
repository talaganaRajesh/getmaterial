Here’s a clean `README.md` draft for your project based on your description:

````markdown
# Sensitive Content Detection using AI

## Author
**Hi, I am Arun R (arun-r-007)**

## Project Overview
This project aims to detect sensitive and adult content in PDF files uploaded by students. Some students were uploading PDFs that contained inappropriate content. To prevent this, an AI-based moderation system was integrated, which scans the PDF content before allowing uploads.

---

## Problem Statement
Students often upload notes and documents in PDF format. Some of these documents may contain adult or inappropriate content, which should not be accessible on the platform. The goal is to automatically detect such content and prevent it from being uploaded, ensuring the platform remains safe and appropriate for all users.

---

## Changes Made
I have modified both the **frontend** and **server** parts of the project to integrate content moderation:

### **Frontend Changes**
- `frontend/src/components/Upload.jsx` – Added AI moderation checks before uploading PDFs.
- `frontend/package.json` & `frontend/package-lock.json` – Added new dependencies for PDF parsing and AI integration.

### **Server Changes**
- `server/` folder:
  - `moderation.js` – Handles text moderation using AI.
  - `.env` – Contains API keys and configuration for AI.
  - `server.js` & `uploadserv.js` – Handles file uploads to Google Drive.
- `server/package.json` & `server/package-lock.json` – Added dependencies for file handling, CORS, and AI APIs.
- `server/node_modules` – Installed libraries.

### **Libraries Installed**
```bash
npm install express multer pdf-parse openai dotenv
npm install pdfjs-dist
npm install express cors body-parser openai
````

---

## Running the Project

### **Frontend**

```bash
cd frontend

terminal - 1
        npm run dev
```

### **Server**

```bash
cd server

terminal - 2
        npm start   # Starts the upload server

terminal - 3
        node moderation.js   # Starts the moderation server
```

### **Ensure all servers are running**

* **Moderation server:** [http://localhost:5000](http://localhost:5000)
* **Upload server:** [http://localhost:10000](http://localhost:10000)
* **Frontend:** [http://localhost:5173](http://localhost:5173) (Vite port may vary)

---

## Summary of Workflow

1. User selects a PDF file in the frontend.
2. The PDF content is extracted and sent to the **moderation server**.
3. If the content is flagged as sensitive or adult, the file upload is blocked.
4. If the content passes, the file is uploaded to Google Drive.

---

## Important Note

Currently, **the AI moderation does not review content** because using the official OpenAI API requires a subscription. The free trial quota has been exhausted, so moderation cannot run in real-time without incurring costs. To enable real moderation, a valid OpenAI subscription or an alternative free moderation system is required (like `bad-words` or Perspective API).

---

## Files Modified

* **Frontend**

  * `src/components/Upload.jsx`
  * `package.json`
  * `package-lock.json`
* **Server**

  * `moderation.js`
  * `server.js`
  * `uploadserv.js`
  * `.env`
  * `package.json`
  * `package-lock.json`
* `package-lock.json` and `package.json` (root)
* `node_modules` as required

---

## Conclusion

This system provides a framework for detecting sensitive content in PDFs before upload. While the AI moderation is currently disabled due to subscription limits, the system is fully functional for file uploads and can easily integrate AI moderation once a subscription is active.

```

---

If you want, I can also **add a simple “free moderation” alternative** using `bad-words` so your system works without needing OpenAI subscription, and update this README to reflect that.  

Do you want me to do that next?
```
