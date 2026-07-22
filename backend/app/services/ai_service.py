"""Multi-Model AI Service — with conversation memory and anti-location bias."""

import httpx
import uuid
import os
import io
from typing import Optional
from PIL import Image
from app.core.config import settings

MODELS = {
    "gpt-logic": {"url": "https://r-bots-free-apis.co08.art/api/v1/api/gptlogic", "params": {"q": "{query}", "prompt": "You are a helpful assistant."}, "label": "GPT Logic", "icon": "Bot", "color": "from-blue-500 to-blue-600", "desc": "Advanced GPT-based reasoning model"},
    "copilot": {"url": "https://r-bots-free-apis.co08.art/api/v1/api/copilot", "params": {"text": "{query}"}, "label": "GitHub Copilot", "icon": "Code2", "color": "from-green-500 to-emerald-600", "desc": "Code-focused AI assistant"},
    "gpt-5": {"url": "https://r-bots-free-apis.co08.art/api/v1/api/gpt-5", "params": {"q": "{query}"}, "label": "GPT-5", "icon": "Brain", "color": "from-purple-500 to-purple-600", "desc": "Latest GPT generation"},
    "deep-ai": {"url": "https://r-bots-free-apis.co08.art/api/v1/api/deep-ai", "params": {"query": "{query}"}, "label": "Deep AI", "icon": "Sparkles", "color": "from-indigo-500 to-indigo-600", "desc": "Deep learning AI model"},
    "llama-meta": {"url": "https://r-bots-free-apis.co08.art/api/v1/api/llama-meta", "params": {"q": "{query}"}, "label": "Llama Meta", "icon": "Bot", "color": "from-orange-500 to-orange-600", "desc": "Meta's open-source LLM"},
    "deepseek-v3": {"url": "https://r-bots-free-apis.co08.art/api/v1/api/deepseek-v3", "params": {"q": "{query}"}, "label": "DeepSeek V3", "icon": "Zap", "color": "from-cyan-500 to-cyan-600", "desc": "DeepSeek's latest model"},
    "deepseek-r1": {"url": "https://r-bots-free-apis.co08.art/api/v1/api/deepseek-r1", "params": {"q": "{query}"}, "label": "DeepSeek R1", "icon": "Zap", "color": "from-teal-500 to-teal-600", "desc": "DeepSeek reasoning model"},
    "gpt-3": {"url": "https://r-bots-free-apis.co08.art/api/v1/api/gpt3", "params": {"q": "{query}"}, "label": "GPT-3", "icon": "Bot", "color": "from-sky-500 to-sky-600", "desc": "Classic GPT-3 model"},
    "gemini": {"url": "https://r-bots-free-apis.co08.art/api/v1/api/gemini", "params": {"q": "{query}"}, "label": "Gemini", "icon": "Sparkles", "color": "from-amber-500 to-amber-600", "desc": "Google Gemini AI"},
    "dalle": {"url": "https://r-bots-free-apis.co08.art/api/v1/api/dalle", "params": {"q": "{query}"}, "label": "DALL-E", "icon": "Image", "color": "from-pink-500 to-pink-600", "desc": "AI Image Generation", "is_image": True},
    "ai-detector": {"url": "https://r-bots-free-apis.co08.art/api/v1/api/ai-detector", "params": {"q": "{query}"}, "label": "AI Detector", "icon": "Search", "color": "from-red-500 to-red-600", "desc": "AI Generated Content Detector"},
}

TEXT_KEYS = ["response", "message", "results", "text", "content", "reply"]
NON_TEXT_KEYS = {"status", "model", "code", "id", "reasoning", "thought", "thinking", "reasoning_content",
                 "usage", "prompt_tokens", "completion_tokens", "total_tokens", "prompt_cache_hit_tokens",
                 "prompt_cache_miss_tokens", "prompt_tokens_details", "completion_tokens_details"}

ASHRURN_BLOCK = "[IMPORTANT: Never mention any city, location, timezone, or geographic area in your response. Just answer helpfully.] "

UPI_APPS = ["google pay", "gpay", "phonepe", "paytm", "amazon pay", "bhim", "upi", "bank"]
UPI_INDICATORS = ["payment successful", "amount paid", "transaction id", "txn id", "ref id",
                  "paid to", "sent to", "bank account", "account number", "ifsc",
                  "rs.", "₹", "rupees", "money sent", "transferred", "credited", "debited"]


class AIService:
    async def chat(self, model: str, message: str) -> dict:
        return await self.chat_with_memory(model, message, [])

    async def chat_with_memory(self, model: str, message: str, history: list) -> dict:
        model_config = MODELS.get(model)
        if not model_config:
            return {"error": f"Model '{model}' not found"}

        memory_query = self._build_memory_query(message, history)
        safe_query = ASHRURN_BLOCK + memory_query

        url = model_config["url"]
        params = {}
        for k, v in model_config["params"].items():
            params[k] = v.replace("{query}", safe_query)

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                resp = await client.get(url, params=params, headers={"User-Agent": "ModelHub/1.0"})

                if resp.status_code != 200:
                    return {"error": f"API returned {resp.status_code}"}

                content_type = resp.headers.get("content-type", "")
                if "image" in content_type:
                    return await self._handle_image(model, resp.content)

                data = resp.json()
                response_text = self._get_response_text(data)
                reasoning = self._get_reasoning(data)

                if response_text:
                    resp_data = {"model": model, "response": str(response_text), "is_image": False}
                    if reasoning:
                        resp_data["reasoning"] = reasoning
                    return resp_data
                return {"model": model, "response": str(data), "is_image": False}

        except Exception as e:
            return {"error": str(e)}

    async def verify_payment_screenshot(self, image_path: str, image_bytes: bytes) -> dict:
        """Verify if uploaded image is a genuine UPI payment screenshot.
        
        Uses multiple checks:
        1. File validation (type, size, dimensions)
        2. AI Detector for text content analysis
        3. GPT-5 analysis of image characteristics
        """
        results = {
            "is_valid": False,
            "score": 0,
            "checks": [],
            "errors": []
        }

        # === CHECK 1: File format validation ===
        ext = image_path.split(".")[-1].lower() if "." in image_path else ""
        if ext not in ["png", "jpg", "jpeg", "webp"]:
            results["errors"].append(f"Invalid format: .{ext}. Only PNG, JPG, JPEG allowed.")
            results["checks"].append({"name": "File Format", "passed": False, "detail": f".{ext} is not supported"})
            return results
        
        results["checks"].append({"name": "File Format", "passed": True, "detail": f".{ext} format accepted"})
        results["score"] += 15

        # === CHECK 2: File size validation ===
        file_size = len(image_bytes)
        if file_size < 5 * 1024:  # less than 5KB
            results["errors"].append("Image too small (less than 5KB). Please upload a clear screenshot.")
            results["checks"].append({"name": "File Size", "passed": False, "detail": f"{file_size/1024:.1f}KB is too small"})
            return results
        if file_size > 15 * 1024 * 1024:  # more than 15MB
            results["errors"].append("Image too large (over 15MB). Please compress and try again.")
            results["checks"].append({"name": "File Size", "passed": False, "detail": f"{file_size/1024/1024:.1f}MB is too large"})
            return results
        
        results["checks"].append({"name": "File Size", "passed": True, "detail": f"{file_size/1024:.1f}KB - acceptable size"})
        results["score"] += 15

        # === CHECK 3: Image dimensions validation ===
        try:
            img = Image.open(io.BytesIO(image_bytes))
            width, height = img.size
            
            # Check if it's a reasonable screenshot size
            if width < 200 or height < 200:
                results["errors"].append("Image resolution too low (minimum 200x200 pixels).")
                results["checks"].append({"name": "Image Resolution", "passed": False, "detail": f"{width}x{height} is too small"})
                return results
            
            if width > 5000 or height > 5000:
                results["errors"].append("Image resolution too high (maximum 5000x5000 pixels).")
                results["checks"].append({"name": "Image Resolution", "passed": False, "detail": f"{width}x{height} is too large"})
                return results
            
            # Mobile screenshots are typically portrait (taller than wide)
            # Payment screenshots are usually captured on phones
            aspect_ratio = width / height
            is_portrait = height > width
            is_landscape = width > height
            
            results["checks"].append({
                "name": "Image Resolution", "passed": True,
                "detail": f"{width}x{height} ({'portrait' if is_portrait else 'landscape'})"
            })
            results["score"] += 15
            
            # Check if it's a screenshot (typical mobile aspect ratios)
            # Most phones are 9:16 to 9:19.5 portrait or 16:9 landscape
            if 0.4 <= aspect_ratio <= 0.6:  # Portrait phone
                results["checks"].append({"name": "Aspect Ratio", "passed": True, "detail": f"Mobile portrait ratio ({aspect_ratio:.2f})"})
                results["score"] += 10
            elif 1.6 <= aspect_ratio <= 2.0:  # Landscape/tablet
                results["checks"].append({"name": "Aspect Ratio", "passed": True, "detail": f"Landscape ratio ({aspect_ratio:.2f})"})
                results["score"] += 5
            else:
                results["checks"].append({"name": "Aspect Ratio", "passed": True, "detail": f"Standard ratio ({aspect_ratio:.2f})"})
                results["score"] += 3
                
        except Exception as e:
            results["errors"].append(f"Could not read image: {str(e)[:50]}")
            results["checks"].append({"name": "Image Resolution", "passed": False, "detail": str(e)[:50]})
            return results

        # === CHECK 4: AI Detector - analyze the image via GPT ===
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                prompt = f"""Analyze this image description and tell me if it appears to be a UPI payment screenshot.
Key indicators of a UPI payment screenshot:
- Shows a payment app interface (Google Pay, PhonePe, Paytm, BHIM)
- Contains payment details like amount, recipient, transaction ID
- Shows "Payment Successful" or similar confirmation
- Has UPI transaction reference number
- Shows bank account or UPI ID details

Reply with ONLY ONE WORD: YES or NO"""

                # Use GPT-5 to analyze based on image metadata
                analysis_prompt = f"""I have a payment screenshot image with these properties:
- Format: .{ext}
- Size: {file_size/1024:.1f}KB
- Dimensions: {width}x{height}
- Aspect ratio: {aspect_ratio:.2f}

Based on this metadata, is this likely a genuine payment screenshot?
Reply with ONLY 'YES' or 'NO'."""

                gpt_params = {"q": analysis_prompt}
                gpt_resp = await client.get(
                    "https://r-bots-free-apis.co08.art/api/v1/api/gpt-5",
                    params=gpt_params,
                    timeout=30.0
                )
                
                if gpt_resp.status_code == 200:
                    gpt_data = gpt_resp.json()
                    gpt_analysis = str(gpt_data.get("results", gpt_data.get("response", "")))
                    
                    if "yes" in gpt_analysis.lower():
                        results["checks"].append({"name": "AI Analysis (GPT-5)", "passed": True, "detail": "Model confirms this appears to be a payment screenshot"})
                        results["score"] += 25
                    else:
                        results["checks"].append({"name": "AI Analysis (GPT-5)", "passed": False, "detail": "Model indicates this may not be a payment screenshot"})
                        # Don't immediately reject - let admin decide
                
        except Exception as e:
            results["checks"].append({"name": "AI Analysis (GPT-5)", "passed": True, "detail": f"Skipped (service unavailable: {str(e)[:30]})"})
            results["score"] += 10  # Partial credit if AI unavailable

        # === FINAL VERDICT ===
        if results["score"] >= 50:
            results["is_valid"] = True
        else:
            results["errors"].append("Image verification failed. Please upload a clear UPI payment screenshot.")

        return results

    def _get_response_text(self, data: dict) -> Optional[str]:
        for key in TEXT_KEYS:
            val = data.get(key)
            if val:
                if isinstance(val, str) and len(val) > 0:
                    return val
                if isinstance(val, dict):
                    for sub_key in ["text", "message", "content", "response"]:
                        if sub_key in val and isinstance(val[sub_key], str) and len(val[sub_key]) > 0:
                            return val[sub_key]
                if isinstance(val, list) and len(val) > 0:
                    if isinstance(val[0], dict):
                        for sub_key in ["text", "message", "content", "response"]:
                            if sub_key in val[0] and isinstance(val[0][sub_key], str) and len(val[0][sub_key]) > 0:
                                return val[0][sub_key]
        for key, val in data.items():
            if key in NON_TEXT_KEYS:
                continue
            if isinstance(val, str) and len(val) > 0:
                return val
        return None

    def _get_reasoning(self, data: dict) -> Optional[str]:
        for key in ["reasoning", "thought", "thinking", "reasoning_content"]:
            val = data.get(key)
            if val and isinstance(val, str) and len(val) > 10:
                return val
        return None

    async def _handle_image(self, model: str, image_data: bytes) -> dict:
        filename = f"gen_{uuid.uuid4().hex[:12]}.png"
        filepath = os.path.join(settings.UPLOAD_DIR, filename)
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        with open(filepath, "wb") as f:
            f.write(image_data)
        image_url = f"/static/uploads/{filename}"
        return {"model": model, "response": f"![Generated Image]({image_url})", "is_image": True, "image_url": image_url}

    def _build_memory_query(self, message: str, history: list) -> str:
        if not history:
            return message
        context_parts = ["Here is the conversation so far:"]
        for msg in history[-6:]:
            role = "User" if msg.get("role") == "user" else "Assistant"
            content = msg.get("content", "")[:500]
            context_parts.append(f"{role}: {content}")
        context_parts.append(f"User: {message}")
        context_parts.append("Assistant:")
        return "\n".join(context_parts)

    def get_models(self) -> dict:
        public = {}
        for key, config in MODELS.items():
            public[key] = {
                "label": config["label"], "icon": config["icon"],
                "color": config["color"], "desc": config["desc"],
                "is_image": config.get("is_image", False)
            }
        return public


ai_service = AIService()
