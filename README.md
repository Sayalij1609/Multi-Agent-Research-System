# 🧠 SYNAPSE — Multi-Agent AI Research System

A multi-agent AI research system that automates the entire research workflow. Four specialized AI agents collaborate in sequence — **searching** the web, **extracting** content, **writing** a structured report, and **reviewing** it for quality — all running locally via [Ollama](https://ollama.com).

![Python](https://img.shields.io/badge/Python-3.12-3776ab?logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.x-000000?logo=flask)
![LangChain](https://img.shields.io/badge/LangChain-0.3-1c3c3c)
![Ollama](https://img.shields.io/badge/Ollama-Local%20LLM-white)

---

## ✨ Features

- **4 Specialized Agents** — each handles one step of the research pipeline
- **100% Local** — runs on your machine using Ollama (no API keys needed)
- **Beautiful Web UI** — glassmorphism design with light/dark mode
- **Real-Time Progress** — Server-Sent Events stream each agent's status live
- **Markdown Reports** — download the final report as `.md`
- **Quality Scoring** — the Critic agent rates the report and gives feedback

---

## 🏗️ Architecture

```
User Query
    │
    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Search Agent │ ──▶ │ Reader Agent │ ──▶ │    Writer    │ ──▶ │    Critic    │
│  (DuckDuckGo)│     │  (Scraper)   │     │  (Report)    │     │  (Review)    │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                                      │
                                                                      ▼
                                                              Final Report +
                                                              Quality Score
```

| Agent | Role | Tool |
|-------|------|------|
| **Search Agent** | Searches the web for relevant sources | DuckDuckGo (via `ddgs`) |
| **Reader Agent** | Scrapes and extracts content from top URLs | BeautifulSoup |
| **Writer** | Generates a structured research report | LLM Chain |
| **Critic** | Reviews the report and provides a score | LLM Chain |

---

## 📁 Project Structure

```
Multi Agent AI Research System/
├── app.py              # Flask web server (SSE streaming)
├── pipeline.py         # Research pipeline (CLI + streaming generator)
├── agents.py           # Agent & chain definitions (LLM, prompts)
├── tools.py            # LangChain tools (web_search, scrape_url)
├── requirements.txt    # Python dependencies
└── templates/
    └── index.html      # Web UI (HTML/CSS/JS)
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+**
- **Ollama** installed and running — [Download Ollama](https://ollama.com/download)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/multi-agent-ai-research-system.git
cd multi-agent-ai-research-system
```

### 2. Create a virtual environment

```bash
python -m venv .venv
```

Activate it:

- **Windows:** `.venv\Scripts\activate`
- **macOS/Linux:** `source .venv/bin/activate`

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Pull the LLM model

```bash
ollama pull llama3.2
```

> You can use any Ollama model. To change it, edit the `model` parameter in `agents.py`.

### 5. Run the app

```bash
python app.py
```

Open **http://localhost:5000** in your browser.

---

## 🖥️ Usage

1. Enter a research topic in the input field (e.g., *"Recent breakthroughs in solid-state batteries"*)
2. Click **Start Research**
3. Watch the 4 agents execute in real time:
   - 🔍 **Search Agent** — finds relevant web sources
   - 📄 **Reader Agent** — extracts content from the best URL
   - ✍️ **Writer** — drafts a structured report with Introduction, Key Findings, Conclusion, and Sources
   - ⭐ **Critic** — scores the report (X/10) with strengths and areas to improve
4. View the final report rendered as formatted Markdown
5. Click **↓ Download Markdown** to save the report

---

## ⚙️ Configuration

### Change the LLM model

In [`agents.py`](agents.py), modify the `ChatOllama` initialization:

```python
llm = ChatOllama(
    model="llama3.2",      # Change to any Ollama model
    temperature=0,
    num_ctx=8192
)
```

Popular options: `mistral`, `llama3.2`, `gemma2`, `qwen2.5`

### Change the Flask port

In [`app.py`](app.py), modify the last line:

```python
app.run(debug=True, port=5000, threaded=True)
```

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **LLM** | Ollama (local) |
| **Agent Framework** | LangChain |
| **Web Search** | DuckDuckGo (`ddgs`) |
| **Web Scraping** | BeautifulSoup + Requests |
| **Backend** | Flask |
| **Frontend** | Vanilla HTML/CSS/JS |
| **Streaming** | Server-Sent Events (SSE) |

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ using LangChain, Ollama & Flask
</p>
