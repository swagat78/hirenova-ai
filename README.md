# Hire Nova - AI Resume Generator

Hire Nova is a premium, AI-powered SaaS web application designed to instantly convert your raw job history or existing PDF resume into a beautifully formatted, ATS-optimized LaTeX PDF resume tailored specifically to a target Job Description.

## Live Demo & Workflows
- **Frontend Deployment:** [https://hirenova-ai.netlify.app/](https://hirenova-ai.netlify.app/)
- **Backend Automation (n8n):** Hosted on AWS EC2 via Docker
  - Main Generation Workflow: http://54.144.42.4:5678/workflow/lHMNQoyNbYqMiFRP
  - Status Polling Workflow: http://54.144.42.4:5678/workflow/0yY8MwArCIihCCCq

---

## Tech Stack & Architecture

Hire Nova utilizes a highly decoupled, serverless-style architecture leveraging modern web technologies and robust automation:

- **Frontend:** React.js, Vite, Tailwind CSS, Lucide Icons (Dark Mode UI, Glassmorphism).
- **Backend Orchestrator:** n8n (Self-hosted on AWS EC2 using Docker).
- **AI Engine:** Google Gemini 1.5 Flash (via n8n API integration).
- **Database & Storage:** Supabase (PostgreSQL for logging job states, Supabase Buckets for PDF storage).
- **Document Engine:** CloudConvert API (Compiles generated LaTeX code into final PDF).
- **Hosting:** Netlify (Frontend) with Vite proxy routing `/api/` to the AWS backend.

---

## How It Works

1. **User Input:** Users can upload an existing PDF resume, paste raw text, or build from scratch using the React UI. They also provide a target Job Description.
2. **Webhook Trigger:** The React app submits a `multipart/form-data` request to the n8n backend.
3. **AI Processing:** n8n extracts text from the PDF (if uploaded), structures it, and sends it to the Gemini 1.5 API alongside strict LaTeX formatting rules.
4. **LaTeX Compilation:** The AI-generated LaTeX string is sent to CloudConvert to be rendered into a professional PDF.
5. **Real-time Polling:** Supabase logs the initial job. The React frontend continuously polls the Supabase database via a secondary n8n webhook until the PDF compilation is complete.
6. **Delivery:** The final PDF URL is presented to the user for download, and a copy is automatically emailed to their provided email address via SMTP.

---

## ⚠️ Important Disclaimer & Support

**This application was built utilizing entirely FREE-TIER API Keys and Services.** 
Because of this, you may occasionally experience rate limits, slow generation times, or temporary service errors (especially with CloudConvert or Gemini API usage limits). 

If you encounter any persistent issues or bugs, please feel free to reach out to us at: **hirenovai@gmail.com**

---

## Future Work & Roadmap

We have massive plans to expand Hire Nova into a complete career platform. Upcoming features include:
- **Smart Job Matching:** Automatically suggesting real-time job links that match the generated resume profile.
- **Cover Letter Generation:** Automatically generating highly personalized cover letters matching the resume and job description.
- **Enterprise-Grade Optimization:** Upgrading the backend to handle massive parallel generation requests with enterprise-tier API speed and reliability.
- **More Resume Templates:** Expanding beyond the standard ATS format to include multiple visual LaTeX templates.
- **Improved Document Support:** Adding robust `.docx` parsing and extraction to handle a wider variety of uploaded file types.

---

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/swagat78/hirenova-ai.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

*Note: You must have your n8n workflows active on your backend server for the generation to function locally.*
