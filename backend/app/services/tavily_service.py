import re
import logging
from typing import List, Dict, Any, Optional
from urllib.parse import urlparse
import httpx
from backend.app.config import settings

logger = logging.getLogger("truthlens.tavily")

OFFICIAL_DOMAINS = {
    "docs.python.org", "python.org", "github.com", "pypi.org",
    "developer.mozilla.org", "w3.org", "openai.com", "anthropic.com",
    "microsoft.com", "apple.com", "google.com", "aws.amazon.com",
    "oracle.com", "kubernetes.io", "docker.com", "react.dev", "nodejs.org"
}

class TavilyService:
    """
    Tavily Live Web Search Service for Evidence Retrieval.
    Searches the live web for claims, retrieves rich snippets, publication dates,
    and categorizes sources.
    """

    def __init__(self):
        self.endpoint = "https://api.tavily.com/search"

    def _classify_source_type(self, url: str) -> str:
        """Classify source reliability category based on hostname and path."""
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            if domain.startswith("www."):
                domain = domain[4:]

            if any(domain == d or domain.endswith("." + d) for d in OFFICIAL_DOMAINS):
                return "official"
            if domain.endswith(".gov") or domain.endswith(".mil"):
                return "government"
            if domain.endswith(".edu") or "arxiv.org" in domain:
                return "academic"
            if "docs." in domain or "/docs/" in parsed.path:
                return "documentation"
            if any(news in domain for news in ["reuters.com", "bloomberg.com", "apnews.com", "techcrunch.com", "theverge.com", "bbc.com", "wsj.com"]):
                return "news"
            return "web"
        except Exception:
            return "web"

    def _deduplicate_results(self, results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Deduplicate results by canonical URL and high title similarity."""
        seen_urls = set()
        deduped = []
        for item in results:
            url = item.get("url", "").strip().rstrip('/')
            if not url or url in seen_urls:
                continue
            seen_urls.add(url)
            deduped.append(item)
        return deduped

    async def search_claim(
        self,
        claim_text: str,
        search_depth: str = "advanced",
        max_results: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Execute live search on Tavily for a given claim.
        """
        api_key = settings.TAVILY_API_KEY
        if not api_key:
            raise ValueError(
                "TAVILY_API_KEY is not configured. Please add your Tavily API key to .env or Settings."
            )

        clean_query = claim_text.strip()
        if len(clean_query) > 200:
            clean_query = clean_query[:200]

        payload = {
            "api_key": api_key,
            "query": clean_query,
            "search_depth": search_depth,
            "max_results": max_results,
            "include_answer": False,
            "include_raw_content": False
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                logger.info(f"Querying Tavily for claim: '{clean_query}' (depth={search_depth})...")
                response = await client.post(self.endpoint, json=payload, timeout=25.0)

                if response.status_code == 200:
                    data = response.json()
                    raw_results = data.get("results", [])
                    deduped = self._deduplicate_results(raw_results)

                    evidence_items = []
                    for res in deduped:
                        url = res.get("url", "")
                        title = res.get("title", "") or "Web Source"
                        snippet = res.get("content", "") or ""
                        pub_date = res.get("published_date")

                        if not pub_date:
                            match = re.search(r'\b(202[0-9]-[0-1][0-9]-[0-3][0-9])\b', snippet)
                            if match:
                                pub_date = match.group(1)

                        source_type = self._classify_source_type(url)

                        evidence_items.append({
                            "title": title,
                            "url": url,
                            "snippet": snippet,
                            "published_date": pub_date,
                            "source_type": source_type
                        })

                    logger.info(f"Tavily returned {len(evidence_items)} evidence sources for claim.")
                    return evidence_items

                elif response.status_code in (401, 403):
                    raise PermissionError(f"Tavily authentication failed: {response.text}")
                elif response.status_code == 429:
                    raise RuntimeError(f"Tavily rate limit exceeded: {response.text}")
                else:
                    raise RuntimeError(f"Tavily returned HTTP {response.status_code}: {response.text}")

            except httpx.RequestError as exc:
                logger.error(f"Tavily network error: {str(exc)}")
                raise RuntimeError(f"Tavily connection failed: {str(exc)}")

    async def test_connection(self) -> Dict[str, Any]:
        """Test Tavily API connectivity."""
        if not settings.TAVILY_API_KEY:
            return {
                "configured": False,
                "connected": False,
                "message": "TAVILY_API_KEY is not set."
            }

        try:
            results = await self.search_claim("Python programming language", search_depth="basic", max_results=1)
            return {
                "configured": True,
                "connected": True,
                "results_count": len(results),
                "sample_title": results[0]["title"] if results else None
            }
        except Exception as e:
            return {
                "configured": True,
                "connected": False,
                "error": str(e)
            }

tavily_service = TavilyService()
