from langchain.agents import create_agent
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from tools import web_search, scrape_url

# -----------------------------
# Local LLM Setup (Ollama)
# -----------------------------
llm = ChatOllama(
    model="llama3.2",
    temperature=0,
    num_ctx=8192
)

# -----------------------------
# Search Agent
# -----------------------------
def build_search_agent():
    return create_agent(
        model=llm,
        tools=[web_search]
    )

# -----------------------------
# Reader Agent
# -----------------------------
def build_reader_agent():
    return create_agent(
        model=llm,
        tools=[scrape_url]
    )

# -----------------------------
# Writer Chain
# -----------------------------
writer_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """You are an expert research writer.

Write clear, factual, well-structured, and professional research reports.

Guidelines:
- Use only the provided research.
- Do not make up facts.
- Write in simple, professional language.
- Use proper headings and formatting.
"""
    ),
    (
        "human",
        """Write a detailed research report on the following topic.

Topic:
{topic}

Research Collected:
{research}

Structure your report as:

# Introduction

# Key Findings
(Explain at least 3 major findings.)

# Conclusion

# Sources
(List all URLs found in the research.)
"""
    )
])

writer_chain = writer_prompt | llm | StrOutputParser()

# -----------------------------
# Critic Chain
# -----------------------------
critic_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        """You are a professional research reviewer.

Evaluate the report carefully.

Focus on:
- Accuracy
- Structure
- Completeness
- Clarity
- Usefulness
"""
    ),
    (
        "human",
        """Review the following research report.

Report:
{report}

Respond exactly in this format:

Score: X/10

Strengths:
- Point 1
- Point 2

Areas to Improve:
- Point 1
- Point 2

Final Verdict:
One concise sentence.
"""
    )
])

critic_chain = critic_prompt | llm | StrOutputParser()