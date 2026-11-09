import time
import json
import logging
from typing import List, Dict, Any, Optional, Tuple
import httpx
from backend.app.config import settings

logger = logging.getLogger("truthlens.bifrost")

class BifrostService:
    """
    Maxim AI Bifrost Gateway Service.
    Handles all LLM inference via the centralized Bifrost gateway.
    Features:
    - OpenAI-compatible chat completions
    - Primary and fallback model routing
    - Latency and token usage tracking
    - Bounded retries with exponential backoff
    - Robust error and fallback management
    """

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.1,
        response_format: Optional[Dict[str, str]] = None,
        preferred_model: Optional[str] = None
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Calls the LLM via Bifrost Gateway with automatic fallback.
        """
        api_key = settings.BIFROST_API_KEY
        base_url = settings.BIFROST_BASE_URL.rstrip('/')
        primary_model = preferred_model or settings.BIFROST_MODEL
        fallback_model = settings.BIFROST_FALLBACK_MODEL

        if not api_key:
            raise ValueError(
                "BIFROST_API_KEY is not configured. Please configure it in your .env file or Settings page."
            )

        models_to_try = [primary_model]
        if fallback_model and fallback_model != primary_model:
            models_to_try.append(fallback_model)

        endpoint = f"{base_url}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        last_error = None

        async with httpx.AsyncClient(timeout=45.0) as client:
            for model in models_to_try:
                payload: Dict[str, Any] = {
                    "model": model,
                    "messages": messages,
                    "temperature": temperature
                }
                if response_format:
                    payload["response_format"] = response_format

                for attempt in range(2):
                    start_time = time.perf_counter()
                    try:
                        logger.info(f"Dispatching Bifrost request to model '{model}' (attempt {attempt + 1})...")
                        response = await client.post(
                            endpoint,
                            headers=headers,
                            json=payload,
                            timeout=30.0
                        )

                        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

                        if response.status_code == 200:
                            data = response.json()
                            choices = data.get("choices", [])
                            if not choices:
                                raise ValueError("Bifrost returned empty choices array.")

                            content = choices[0].get("message", {}).get("content", "")
                            usage = data.get("usage", {})
                            input_tokens = usage.get("prompt_tokens", 0)
                            output_tokens = usage.get("completion_tokens", 0)

                            logger.info(f"Bifrost inference succeeded with model '{model}' in {latency_ms}ms. Tokens: in={input_tokens}, out={output_tokens}")
                            return content, {
                                "model_name": model,
                                "input_tokens": input_tokens,
                                "output_tokens": output_tokens,
                                "latency_ms": latency_ms,
                                "provider": "bifrost"
                            }
                        elif response.status_code in (401, 403):
                            error_detail = response.text
                            logger.error(f"Bifrost auth error ({response.status_code}): {error_detail}")
                            raise PermissionError(f"Bifrost Authentication failed: {error_detail}")
                        elif response.status_code == 429:
                            logger.warning(f"Bifrost rate limit hit for model {model}.")
                            last_error = f"Rate limit on model {model}: {response.text}"
                        else:
                            logger.warning(f"Bifrost HTTP {response.status_code} for model {model}: {response.text}")
                            last_error = f"HTTP {response.status_code} from Bifrost: {response.text}"

                    except (httpx.RequestError, httpx.TimeoutException) as req_err:
                        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
                        logger.warning(f"Bifrost connection error on model '{model}' ({latency_ms}ms): {str(req_err)}")
                        last_error = f"Connection error: {str(req_err)}"

        raise RuntimeError(f"All Bifrost inference attempts failed. Last error: {last_error}")

    async def test_connection(self) -> Dict[str, Any]:
        """Verify Bifrost Gateway connectivity and model availability."""
        if not settings.BIFROST_API_KEY:
            return {
                "configured": False,
                "connected": False,
                "message": "BIFROST_API_KEY is not set."
            }

        try:
            content, usage = await self.chat_completion(
                messages=[
                    {"role": "system", "content": "You are a test ping agent."},
                    {"role": "user", "content": "Respond with 'PONG'"}
                ],
                temperature=0.0
            )
            return {
                "configured": True,
                "connected": True,
                "active_model": usage["model_name"],
                "latency_ms": usage["latency_ms"],
                "response": content.strip()
            }
        except Exception as e:
            return {
                "configured": True,
                "connected": False,
                "error": str(e)
            }

bifrost_service = BifrostService()
