import json
import uuid
import os
import io
import re
from datetime import datetime
from flask import Flask, render_template, request, Response, jsonify, send_file
from pipeline import run_research_pipeline_stream
from fpdf import FPDF

app = Flask(__name__)

HISTORY_FILE = os.path.join(os.path.dirname(__file__), "research_history.json")


# ── History helpers ──────────────────────────────────────────

def load_history():
    """Load research history from JSON file."""
    if not os.path.exists(HISTORY_FILE):
        return []
    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return []


def save_history(history):
    """Save research history to JSON file."""
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(history, f, ensure_ascii=False, indent=2)


def add_to_history(topic, state):
    """Append a completed research to history."""
    history = load_history()
    entry = {
        "id": str(uuid.uuid4()),
        "topic": topic,
        "timestamp": datetime.now().isoformat(),
        "report": state.get("report", ""),
        "feedback": state.get("feedback", ""),
        "search_results": state.get("search_results", ""),
        "scraped_content": state.get("scraped_content", ""),
    }
    history.insert(0, entry)  # newest first
    save_history(history)
    return entry["id"]


# ── PDF generation ───────────────────────────────────────────

class ResearchPDF(FPDF):
    """Custom PDF with header/footer for research reports."""

    def header(self):
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(100, 100, 100)
        self.cell(0, 8, "SYNAPSE Research Report", align="L")
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "", 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")


def _sanitize(text):
    """Remove characters unsupported by the built-in Helvetica font."""
    # Replace common Unicode with ASCII equivalents
    replacements = {
        '\u2013': '-', '\u2014': '--', '\u2018': "'", '\u2019': "'",
        '\u201c': '"', '\u201d': '"', '\u2026': '...', '\u2022': '-',
        '\u2010': '-', '\u2011': '-', '\u2012': '-', '\u00a0': ' ',
        '\u200b': '', '\u200c': '', '\u200d': '', '\ufeff': '',
        '\u2713': 'v', '\u2717': 'x', '\u2192': '->', '\u2190': '<-',
        '\u00b7': '-', '\u25cf': '-', '\u25cb': 'o', '\u2605': '*',
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    # Strip remaining non-latin1 characters
    return text.encode('latin-1', errors='replace').decode('latin-1')


def markdown_to_pdf(report_text, topic="Research Report"):
    """Convert markdown report text to a styled PDF."""
    pdf = ResearchPDF()
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    # Title
    pdf.set_font("Helvetica", "B", 18)
    pdf.set_text_color(30, 30, 30)
    pdf.multi_cell(0, 10, _sanitize(topic))
    pdf.ln(4)

    # Timestamp
    pdf.set_font("Helvetica", "", 9)
    pdf.set_text_color(130, 130, 130)
    pdf.cell(0, 6, f"Generated on {datetime.now().strftime('%B %d, %Y at %H:%M')}")
    pdf.ln(10)

    # Line separator
    pdf.set_draw_color(200, 200, 200)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(6)

    # Parse and render markdown lines
    lines = report_text.split("\n")

    for line in lines:
        stripped = line.strip()

        if not stripped:
            pdf.ln(3)
            continue

        # Headings
        if stripped.startswith("### "):
            pdf.ln(4)
            pdf.set_font("Helvetica", "B", 12)
            pdf.set_text_color(50, 50, 50)
            pdf.multi_cell(0, 7, _sanitize(stripped[4:]))
            pdf.ln(2)

        elif stripped.startswith("## "):
            pdf.ln(5)
            pdf.set_font("Helvetica", "B", 14)
            pdf.set_text_color(40, 40, 40)
            pdf.multi_cell(0, 8, _sanitize(stripped[3:]))
            pdf.ln(2)

        elif stripped.startswith("# "):
            pdf.ln(6)
            pdf.set_font("Helvetica", "B", 16)
            pdf.set_text_color(30, 30, 30)
            pdf.multi_cell(0, 9, _sanitize(stripped[2:]))
            pdf.ln(3)

        # Bullet points
        elif stripped.startswith("- ") or stripped.startswith("* "):
            pdf.set_font("Helvetica", "", 10)
            pdf.set_text_color(60, 60, 60)
            text = re.sub(r'\*\*(.*?)\*\*', r'\1', stripped[2:])
            text = re.sub(r'\*(.*?)\*', r'\1', text)
            pdf.cell(6)  # indent
            pdf.multi_cell(0, 6, "  - " + _sanitize(text))
            pdf.ln(1)

        # Numbered lists
        elif re.match(r'^\d+\.\s', stripped):
            pdf.set_font("Helvetica", "", 10)
            pdf.set_text_color(60, 60, 60)
            text = re.sub(r'\*\*(.*?)\*\*', r'\1', stripped)
            text = re.sub(r'\*(.*?)\*', r'\1', text)
            pdf.cell(6)
            pdf.multi_cell(0, 6, _sanitize(text))
            pdf.ln(1)

        # Normal paragraph
        else:
            pdf.set_font("Helvetica", "", 10)
            pdf.set_text_color(60, 60, 60)
            text = re.sub(r'\*\*(.*?)\*\*', r'\1', stripped)
            text = re.sub(r'\*(.*?)\*', r'\1', text)
            text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)  # links
            pdf.multi_cell(0, 6, _sanitize(text))
            pdf.ln(1)

    return pdf.output()


# ── Routes ───────────────────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/run")
def run_pipeline():
    """SSE endpoint — streams pipeline step events as JSON."""
    topic = request.args.get("topic", "").strip()

    if not topic:
        return Response('data: {"error": "No topic provided"}\n\n',
                        content_type="text/event-stream")

    def generate():
        try:
            for event in run_research_pipeline_stream(topic):
                # When pipeline completes, save to history
                if event.get("step") == "complete" and "state" in event:
                    entry_id = add_to_history(topic, event["state"])
                    event["history_id"] = entry_id

                yield f"data: {json.dumps(event)}\n\n"
        except Exception as e:
            yield f'data: {json.dumps({"error": str(e)})}\n\n'

    return Response(
        generate(),
        content_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )


@app.route("/download-pdf", methods=["POST"])
def download_pdf():
    """Generate and return a PDF from the report text."""
    data = request.get_json()
    report = data.get("report", "")
    topic = data.get("topic", "Research Report")

    if not report:
        return jsonify({"error": "No report provided"}), 400

    pdf_bytes = markdown_to_pdf(report, topic)
    buffer = io.BytesIO(pdf_bytes)
    buffer.seek(0)

    safe_name = re.sub(r'[^\w\s-]', '', topic)[:50].strip().replace(' ', '_')
    filename = f"synapse_{safe_name}.pdf"

    return send_file(
        buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=filename,
    )


@app.route("/history")
def get_history():
    """Return list of past research (summary only)."""
    history = load_history()
    summaries = [
        {
            "id": h["id"],
            "topic": h["topic"],
            "timestamp": h["timestamp"],
        }
        for h in history
    ]
    return jsonify(summaries)


@app.route("/history/<entry_id>")
def get_history_entry(entry_id):
    """Return full details of a specific research entry."""
    history = load_history()
    for h in history:
        if h["id"] == entry_id:
            return jsonify(h)
    return jsonify({"error": "Not found"}), 404


@app.route("/history/<entry_id>", methods=["DELETE"])
def delete_history_entry(entry_id):
    """Delete a specific research entry."""
    history = load_history()
    history = [h for h in history if h["id"] != entry_id]
    save_history(history)
    return jsonify({"ok": True})


if __name__ == "__main__":
    app.run(debug=True, port=5000, threaded=True)
