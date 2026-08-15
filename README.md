# ⚡ SYNAPSE AI — Autonomous Multi-Agent Research System

An enterprise-grade, multi-agent AI research intelligence platform that automates complex web research workflows. Four specialized AI agents collaborate in real-time — **searching** live web intelligence, **extracting & scraping** content, **synthesizing** structured executive reports, and **auditing** quality — producing downloadable **Word (.docx)**, **PDF**, and **Markdown** reports with verified sources.

![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.12+-3776AB?logo=python&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-0.3-1C3C3C?logo=langchain)
![License](https://img.shields.io/badge/License-MIT-green.svg)

---

## ✨ Key Features & Capabilities

- 🤖 **4 Specialized Autonomous AI Agents**:
  - 🔍 **Search Agent**: Queries live web search via DuckDuckGo & extracts source URLs.
  - 📄 **Reader Agent**: Scrapes web content and strips noise for deep analysis.
  - ✍️ **Writer Agent**: Synthesizes executive research reports with structured sections.
  - ⭐ **Critic Agent**: Audits report quality, scores factual completeness (X/10), and details key strengths.
- 📄 **Multi-Format Export Suite**:
  - 📘 **Microsoft Word (`.docx`)**: Custom styled Word documents with proper headings, lists, and formatting (`python-docx`).
  - 📕 **PDF Document (`.pdf`)**: Formatted PDF reports generated dynamically (`fpdf2`).
  - 📝 **Raw Markdown (`.md`)**: Instant download for note-taking tools like Obsidian or Notion.
  - 📋 **1-Click Clipboard Copy**: Instantly copy full synthesized reports.
- 🌐 **Discovered Web News & Resources Container**:
  - Interactive grid displaying domain badges, Google favicons, article snippets, 1-click URL copy, and direct external links.
- 🔬 **Multi-Tab Intelligence Hub**:
  - Structured output tabs: `📝 Executive Report`, `🌐 Web News & Sources`, `⭐ Quality Audit Review`, and `🛠️ Agent Telemetry`.
- 📜 **History Archive Modal**:
  - Integrated search-filterable archive to reload or manage past research sessions anytime.
- 🎨 **Enterprise UI Design**:
  - High-contrast Deep Indigo Plum (`#2B2554`) & Rose Pink (`#EF526E`) palette on a crisp **pure white background** at true **100% resolution scale**.

---

## 🏗️ System Architecture

```
                                  ┌───────────────────────────┐
                                  │      SYNAPSE AI UI        │
                                  │  (React 19 + Vite SPA)    │
                                  └─────────────┬─────────────┘
                                                │ REST API
                                                ▼
                                  ┌───────────────────────────┐
                                  │     FastAPI Backend       │
                                  │       (app.py)            │
                                  └─────────────┬─────────────┘
                                                │
                                                ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   Search Agent   │ ──►│   Reader Agent   │ ──►│   Writer Agent   │ ──►│   Critic Agent   │
│ (Live Web Search)│    │(Scrape & Extract)│    │(Report Synthesis)│    │ (Quality Audit)  │
└──────────────────┘    └──────────────────┘    └──────────────────┘    └──────────────────┘
```

---

## 📁 Project Structure

```
Multi Agent AI Research System/
├── app.py                     # FastAPI backend (Endpoints: /run, /history, /download-pdf, /download-docx)
├── agents.py                  # Agent prompts, chains, & LLM execution engine
├── pipeline.py                # Synchronous & SSE streaming multi-agent execution pipeline
├── tools.py                   # Search & scraping tools (DuckDuckGo, BeautifulSoup)
├── requirements.txt           # Python dependencies
├── Dockerfile                 # Multi-stage Docker build (Node.js + Python)
├── .dockerignore              # Docker build context exclusions
├── Procfile                   # Cloud platform process start command
├── render.yaml                # Render Blueprint for deployment
├── DOCKER.md                  # Full Docker deployment guide
├── README.md                  # Project documentation
└── frontend/                  # React + Vite Single Page Application
    ├── index.html             # HTML entry point
    ├── vite.config.js         # Vite proxy configuration
    ├── package.json           # Frontend dependencies
    └── src/
        ├── App.jsx            # Main React state & view router
        ├── App.css            # Global modern design system & HSL tokens
        ├── api.js             # Frontend API client
        └── components/
            ├── Topbar.jsx         # Executive navbar with high-res brand badge & navigation
            ├── Home.jsx           # Enterprise landing page & quick-launch cards
            ├── Hero.jsx           # Lab search command panel
            ├── Pipeline.jsx       # Connected multi-agent execution track
            ├── Metrics.jsx        # Telemetry metrics bar
            ├── Results.jsx        # Multi-tab intelligence hub & export suite
            ├── NewsResources.jsx  # Web news & resources grid container
            ├── HistoryModal.jsx   # Research history modal popup
            └── Footer.jsx         # Enterprise tech footer
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+** installed on your system.
- **Node.js 18+** & `npm` installed.
- *(Optional)* **Ollama** installed locally if running offline models (`llama3.2`).

---

### 1. Backend Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Sayalij1609/Multi-Agent-Research-System.git
   cd "Multi Agent AI Research System"
   ```

2. **Create and activate a Python virtual environment**:
   - **Windows**:
     ```powershell
     python -m venv .venv
     .venv\Scripts\activate
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the FastAPI backend server**:
   ```bash
   uvicorn app:app --host 127.0.0.1 --port 5000 --reload
   ```
   The backend API will be available at `http://127.0.0.1:5000`.

---

### 2. Frontend Setup

1. **Navigate to the `frontend` directory**:
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

3. **Start the Vite development server**:
   ```bash
   npm run dev
   ```

4. Open your browser at **`http://localhost:5173`** to access the application.

---

## 💻 Building for Production

To create a production build of the React frontend:

```bash
cd frontend
npm run build
```

This generates an optimized static bundle in `frontend/dist/`.

---

## ⚙️ Configuration & Options

### Switching LLM Providers

In [`agents.py`](agents.py), you can configure the underlying LLM engine:

- **Local Ollama** (Free & 100% On-Device):
  ```python
  from langchain_ollama import ChatOllama
  llm = ChatOllama(model="llama3.2", temperature=0)
  ```

- **Groq API / OpenAI / Anthropic**:
  Set your API key in environment variables or `.env` and initialize the corresponding LangChain LLM class.

---

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| **Frontend** | React 19, Vite, Vanilla CSS3 (Custom Tokens) |
| **Backend** | FastAPI, Uvicorn, Pydantic |
| **Agent Pipeline** | LangChain, LangGraph |
| **Web Search** | DuckDuckGo (`ddgs`) |
| **Web Scraping** | BeautifulSoup4, Requests |
| **Document Export** | `python-docx` (Word), `fpdf2` (PDF) |

---

## 🐳 Docker Deployment

SYNAPSE AI is fully containerized with a **multi-stage Docker build** — a Node.js stage builds the React frontend, and the final Python image serves everything from a single container.

```bash
# Build the image
docker build -t synapse-ai .

# Run the container
docker run -d -p 8000:8000 -e GROQ_API_KEY=your_key_here synapse-ai
```

Open **[http://localhost:8000](http://localhost:8000)** — the FastAPI backend serves both the API and the React SPA.

> 📖 For the full Docker guide (architecture diagrams, Docker Compose, environment variables, cloud deployment, and troubleshooting), see **[DOCKER.md](DOCKER.md)**.

---

## ☁️ Cloud Deployment

SYNAPSE AI is production-ready for cloud platforms:

| Platform | Method | Config File |
|---|---|---|
| **Render** | Auto-detects `Dockerfile` or uses Blueprint | [`render.yaml`](render.yaml) |
| **Railway** | `railway init && railway up` | Auto-detected |
| **Fly.io** | `fly launch && fly deploy` | Auto-detected |

> See the full [Deployment Guide](DOCKER.md#deploying-to-cloud-platforms) for step-by-step instructions.

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).
