from langchain.tools import tool
from ddgs import DDGS
import requests
from bs4 import BeautifulSoup


@tool
def web_search(query: str) -> str:
    """
    Search DuckDuckGo and return the top search results.
    """

    output = []

    try:

        with DDGS() as ddgs:

            results = ddgs.text(
                query,
                max_results=5
            )

            for result in results:

                output.append(
                    f"""
Title : {result.get("title")}

URL : {result.get("href")}

Snippet :
{result.get("body")}
"""
                )

        return "\n-----------------------------\n".join(output)

    except Exception as e:

        return str(e)


@tool
def scrape_url(url: str) -> str:
    """
    Scrape webpage and return readable text.
    """

    try:

        headers = {
            "User-Agent":
            "Mozilla/5.0"
        }

        response = requests.get(
            url,
            timeout=10,
            headers=headers
        )

        soup = BeautifulSoup(
            response.text,
            "html.parser"
        )

        for tag in soup([
            "script",
            "style",
            "nav",
            "footer",
            "header",
            "aside"
        ]):
            tag.decompose()

        text = soup.get_text(
            separator=" ",
            strip=True
        )

        return text[:5000]

    except Exception as e:

        return f"Unable to scrape.\n{e}"
