
from agents import (
    build_search_agent,
    build_reader_agent,
    writer_chain,
    critic_chain
)

from rich import print


def run_research_pipeline(topic: str):

    state = {}

    # ---------------------------------------
    # Search Agent
    # ---------------------------------------

    print("\n" + "=" * 60)
    print("[bold green]STEP 1 : SEARCH AGENT[/bold green]")
    print("=" * 60)

    search_agent = build_search_agent()

    search_result = search_agent.invoke(
        {
            "messages": [
                (
                    "user",
                    f"Find detailed information about {topic}"
                )
            ]
        }
    )

    state["search_results"] = search_result["messages"][-1].content

    print(state["search_results"])

    # ---------------------------------------
    # Reader Agent
    # ---------------------------------------

    print("\n" + "=" * 60)
    print("[bold cyan]STEP 2 : READER AGENT[/bold cyan]")
    print("=" * 60)

    reader_agent = build_reader_agent()

    reader_result = reader_agent.invoke(

        {
            "messages": [

                (
                    "user",

                    f"""
Read the most useful URL from this search result.

Search Result:

{state["search_results"]}
"""
                )
            ]
        }

    )

    state["scraped_content"] = reader_result["messages"][-1].content

    print(state["scraped_content"])

    # ---------------------------------------
    # Writer
    # ---------------------------------------

    print("\n" + "=" * 60)
    print("[bold yellow]STEP 3 : WRITER[/bold yellow]")
    print("=" * 60)

    research = f"""

SEARCH RESULTS

{state["search_results"]}


SCRAPED CONTENT

{state["scraped_content"]}
"""

    state["report"] = writer_chain.invoke(
        {
            "topic": topic,
            "research": research
        }
    )

    print(state["report"])

    # ---------------------------------------
    # Critic
    # ---------------------------------------

    print("\n" + "=" * 60)
    print("[bold magenta]STEP 4 : CRITIC[/bold magenta]")
    print("=" * 60)

    state["feedback"] = critic_chain.invoke(
        {
            "report": state["report"]
        }
    )

    print(state["feedback"])

    return state


# -----------------------------------------------
# Streaming version for Flask SSE
# -----------------------------------------------

def run_research_pipeline_stream(topic: str):
    """
    Generator that yields dicts for each pipeline step.
    Used by the Flask SSE endpoint for real-time updates.
    """

    state = {}

    # Step 1: Search Agent
    yield {"step": "search", "status": "running"}

    search_agent = build_search_agent()

    search_result = search_agent.invoke(
        {
            "messages": [
                (
                    "user",
                    f"Find recent, reliable and detailed information about: {topic}"
                )
            ]
        }
    )

    state["search_results"] = search_result["messages"][-1].content
    yield {"step": "search", "status": "done", "result": state["search_results"]}

    # Step 2: Reader Agent
    yield {"step": "reader", "status": "running"}

    reader_agent = build_reader_agent()

    reader_result = reader_agent.invoke(
        {
            "messages": [
                (
                    "user",
                    f"Based on the following search results about '{topic}', "
                    f"pick the most relevant URL and scrape it for deeper content.\n\n"
                    f"Search Results:\n{state['search_results'][:800]}"
                )
            ]
        }
    )

    state["scraped_content"] = reader_result["messages"][-1].content
    yield {"step": "reader", "status": "done", "result": state["scraped_content"]}

    # Step 3: Writer Chain
    yield {"step": "writer", "status": "running"}

    research = (
        f"SEARCH RESULTS:\n{state['search_results']}\n\n"
        f"DETAILED SCRAPED CONTENT:\n{state['scraped_content']}"
    )

    state["report"] = writer_chain.invoke(
        {
            "topic": topic,
            "research": research
        }
    )

    yield {"step": "writer", "status": "done", "result": state["report"]}

    # Step 4: Critic Chain
    yield {"step": "critic", "status": "running"}

    state["feedback"] = critic_chain.invoke(
        {
            "report": state["report"]
        }
    )

    yield {"step": "critic", "status": "done", "result": state["feedback"]}

    # Final complete signal
    yield {"step": "complete", "status": "done", "state": state}