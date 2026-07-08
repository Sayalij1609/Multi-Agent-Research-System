from dotenv import load_dotenv

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from tools import web_search, scrape_url

# -----------------------------
# Load Environment Variables
# -----------------------------
load_dotenv()

# -----------------------------
# Groq LLM Setup
# -----------------------------
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0,
)

# -----------------------------
# Search Agent (manual tool call)
# -----------------------------
def build_search_agent():
    """Returns a callable that searches the web using DuckDuckGo."""
    class SearchAgent:
        def invoke(self, input_dict):
            messages = input_dict.get("messages", [])
            user_msg = messages[-1][1] if messages else ""

            # Extract the query from the user message
            search_prompt = ChatPromptTemplate.from_messages([
                ("system", "Extract the core search query from the user's request. "
                           "Reply with ONLY the search query, nothing else."),
                ("human", "{request}")
            ])
            chain = search_prompt | llm | StrOutputParser()
            query = chain.invoke({"request": user_msg}).strip()

            # Call the tool directly
            results = web_search.invoke(query)

            return {"messages": [("assistant", results)]}

    return SearchAgent()

# -----------------------------
# Reader Agent (manual tool call)
# -----------------------------
def build_reader_agent():
    """Returns a callable that scrapes a URL from search results."""
    class ReaderAgent:
        def invoke(self, input_dict):
            messages = input_dict.get("messages", [])
            user_msg = messages[-1][1] if messages else ""

            # Extract the best URL from the search results
            url_prompt = ChatPromptTemplate.from_messages([
                ("system", "From the search results below, pick the single most "
                           "relevant and informative URL. Reply with ONLY the URL, nothing else."),
                ("human", "{text}")
            ])
            chain = url_prompt | llm | StrOutputParser()
            url = chain.invoke({"text": user_msg}).strip()

            # Call the tool directly
            content = scrape_url.invoke(url)

            # Summarize what was scraped
            summary = f"Scraped content from {url}:\n\n{content}"

            return {"messages": [("assistant", summary)]}

    return ReaderAgent()

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