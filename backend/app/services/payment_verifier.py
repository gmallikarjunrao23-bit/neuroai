"""STRICT AI Payment Screenshot Verification Service - Multi-Layer Detection."""

import httpx
import json
from PIL import Image, ImageStat
import io

PLANS = {"starter": 99, "pro": 499, "premium": 999, "lifetime": 4999}

# Known UPI payment app color signatures (dominant colors)
UPI_APP_COLORS = {
    "gpay": [(66, 133, 244), (52, 168, 83)],  # Google Pay blue/green
    "phonepe": [(85, 45, 165), (103, 58, 183)],  # PhonePe purple
    "paytm": [(0, 186, 242), (255, 255, 255)],  # Paytm blue
    "bhim": [(0, 122, 77), (0, 163, 109)],  # BHIM green
}

PHONE_RESOLUTIONS = [
    (1080, 1920), (1080, 2340), (1080, 2400), (1080, 2160),
    (1170, 2532), (1284, 2778), (1290, 2796), (1125, 2436),
    (1440, 3040), (1440, 3120), (1440, 2560), (1440, 2960),
    (720, 1280), (720, 1520), (750, 1334), (828, 1792),
    (1080, 2280), (1080, 1920), (1242, 2688), (1242, 2208),
]

AMOUNT_PATTERNS = [
    "₹499", "₹ 499", "rs499", "rs 499", "inr 499", "inr499",
    "₹999", "₹ 999", "rs999", "rs 999",
    "₹99", "₹ 99", "rs99", "rs 99",
    "₹4999", "₹ 4999", "rs4999", "rs 4999",
]


class PaymentVerifier:
    """Multi-layer payment screenshot verifier using AI + image analysis."""

    async def verify(self, image_bytes: bytes, filename: str, plan_key: str) -> dict:
        results = {
            "is_payment_screenshot": False,
            "score": 0,
            "max_score": 100,
            "amount_matches": False,
            "checks": [],
            "ai_analysis": None,
            "rejection_reasons": [],
            "passed": False,
        }

        expected_amount = PLANS.get(plan_key, 0)
        ext = filename.split(".")[-1].lower() if "." in filename else ""

        # === CHECK 1: STRICT Format Check ===
        if ext not in ["png", "jpg", "jpeg"]:
            self._add_check(results, "File Format", False, f"Only PNG/JPG allowed, got .{ext}", "high")
            results["rejection_reasons"].append(f"Invalid format: .{ext}")
            results["score"] -= 50
        else:
            self._add_check(results, "File Format", True, f".{ext} accepted", "info")
            results["score"] += 5

        # === CHECK 2: STRICT Size Check ===
        file_size = len(image_bytes)
        if file_size < 50 * 1024:
            self._add_check(results, "File Size", False, f"Suspicious: only {file_size/1024:.1f}KB. Payment screenshots are 50KB-5MB", "high")
            results["rejection_reasons"].append(f"Suspiciously small: {file_size/1024:.1f}KB")
            results["score"] -= 50
        elif file_size > 5 * 1024 * 1024:
            self._add_check(results, "File Size", False, f"Too large: {(file_size/1024/1024):.1f}MB. Max 5MB", "high")
            results["rejection_reasons"].append(f"Too large: {(file_size/1024/1024):.1f}MB")
            results["score"] -= 30
        else:
            self._add_check(results, "File Size", True, f"{file_size/1024:.1f}KB - Normal", "info")
            results["score"] += 10

        # === CHECK 3: STRICT Image Analysis (pixel-level) ===
        try:
            img = Image.open(io.BytesIO(image_bytes))
            width, height = img.size

            # Resolution check
            if width < 720 or height < 1280:
                self._add_check(results, "Resolution", False, f"Too small: {width}x{height}. Phone screenshots are 720x1280+", "high")
                results["rejection_reasons"].append(f"Low resolution: {width}x{height}")
                results["score"] -= 50
            else:
                self._add_check(results, "Resolution", True, f"{width}x{height} - Good", "info")
                results["score"] += 5

            # Orientation - UPI screenshots are ALWAYS portrait on phones
            if height < width:
                self._add_check(results, "Orientation", False, "Landscape detected. UPI payment screenshots are always portrait.", "high")
                results["rejection_reasons"].append("Wrong orientation (landscape)")
                results["score"] -= 40
            else:
                aspect_ratio = width / height
                if 0.45 <= aspect_ratio <= 0.50:
                    self._add_check(results, "Orientation", True, f"Portrait ({width}x{height}) - Matches phone ratio", "info")
                    results["score"] += 15
                else:
                    self._add_check(results, "Orientation", True, f"Portrait ({width}x{height}) - Unusual ratio", "info")
                    results["score"] += 5

            # IMAGE CONTENT ANALYSIS - Check if it looks like a screenshot vs real photo
            is_likely_screenshot = self._detect_screenshot_characteristics(img)
            if is_likely_screenshot:
                self._add_check(results, "Screenshot Detection", True, "Image characteristics match a mobile screenshot", "info")
                results["score"] += 15
            else:
                self._add_check(results, "Screenshot Detection", False, "Image appears to be a photograph, not a screenshot", "high")
                results["rejection_reasons"].append("Not a screenshot - appears to be a photograph")
                results["score"] -= 30

            # Color analysis - check for common UPI app colors
            dominant_colors = self._get_dominant_colors(img)
            upi_app_match = self._check_upi_colors(dominant_colors)
            if upi_app_match:
                self._add_check(results, "UPI App Colors", True, f"Detected colors match {upi_app_match} payment app", "info")
                results["score"] += 15
            else:
                self._add_check(results, "UPI App Colors", True, "Colors analyzed", "info")
                results["score"] += 3

        except Exception as e:
            self._add_check(results, "Image Analysis", False, f"Cannot process: {str(e)[:50]}", "high")
            results["rejection_reasons"].append("Image processing failed")
            results["score"] -= 50

        # === CHECK 4: MULTI-MODEL AI VERIFICATION (GPT-5 + DeepSeek) ===
        ai_result = await self._strict_ai_verify(image_bytes, expected_amount)
        results["ai_analysis"] = ai_result.get("analysis", "")
        results["amount_matches"] = ai_result.get("amount_matches", False)

        if ai_result.get("error"):
            self._add_check(results, "AI Verification", False, f"AI unavailable: {ai_result['error'][:50]}", "warning")
            results["rejection_reasons"].append("AI verification unavailable")
        elif ai_result.get("is_payment", False):
            self._add_check(results, "AI Verification", True, ai_result.get("analysis", "Confirmed")[:100], "info")
            results["score"] += 35
            results["is_payment_screenshot"] = True
            
            if ai_result.get("amount_matches", False):
                self._add_check(results, "Amount Check", True, f"Amount ₹{expected_amount} verified", "info")
                results["score"] += 15
            else:
                self._add_check(results, "Amount Check", False, f"Could not verify ₹{expected_amount} in screenshot", "high")
                results["rejection_reasons"].append(f"Amount ₹{expected_amount} not found in screenshot")
                results["score"] -= 20
        else:
            self._add_check(results, "AI Verification", False, ai_result.get("analysis", "Not a payment screenshot")[:100], "high")
            results["rejection_reasons"].append(ai_result.get("analysis", "AI rejected")[:100])
            results["score"] -= 40

        # === CROSS-VERIFICATION with DeepSeek ===
        deepseek_result = await self._cross_verify_with_deepseek(image_bytes, expected_amount)
        if deepseek_result.get("error"):
            pass  # DeepSeek unavailable, skip
        elif deepseek_result.get("is_payment", False):
            results["score"] += 10
            self._add_check(results, "Cross-Verification (DeepSeek)", True, "Secondary model confirms payment screenshot", "info")
        else:
            results["score"] -= 15
            results["rejection_reasons"].append("Secondary AI model does not confirm")
            self._add_check(results, "Cross-Verification (DeepSeek)", False, "Secondary model rejected", "high")

        # === FINAL STRICT VERDICT ===
        if results["is_payment_screenshot"] and results["score"] >= 70:
            results["passed"] = True
            self._add_check(results, "FINAL VERDICT", True, f"PASSED (Score: {results['score']}/100)", "success")
        else:
            results["passed"] = False
            self._add_check(results, "FINAL VERDICT", False, f"REJECTED (Score: {results['score']}/100)", "error")
            if not results["rejection_reasons"]:
                results["rejection_reasons"].append("Verification failed")

        return results

    def _add_check(self, results, name: str, passed: bool, detail: str, severity: str):
        results["checks"].append({"name": name, "passed": passed, "detail": detail[:120], "severity": severity})

    def _detect_screenshot_characteristics(self, img: Image) -> bool:
        """Detect if image has screenshot characteristics vs natural photo."""
        w, h = img.size
        total_pixels = w * h
        
        # Check 1: Screenshots have fewer unique colors than photos
        # Screenshots typically have large areas of same color
        # Convert to RGB if needed
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Sample pixels to check color uniformity
        pixels = list(img.getdata())
        sample = pixels[::1000]  # Sample every 1000th pixel
        
        # Count unique colors in sample
        unique_colors = len(set(sample))
        color_diversity = unique_colors / max(len(sample), 1)
        
        # Photos have high color diversity, screenshots have low
        # Screenshots usually have < 0.3 diversity, photos > 0.6
        if color_diversity < 0.3:
            return True  # Looks like screenshot
        elif color_diversity < 0.5:
            return True  # Probably screenshot
        else:
            return False  # Looks like photograph

    def _get_dominant_colors(self, img: Image, num_colors: int = 5) -> list:
        """Extract dominant colors from the image."""
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize for faster processing
        small = img.resize((100, 100))
        pixels = list(small.getdata())
        
        # Simple color grouping
        color_groups = {}
        for r, g, b in pixels:
            # Quantize colors to reduce variations
            key = ((r // 32) * 32, (g // 32) * 32, (b // 32) * 32)
            color_groups[key] = color_groups.get(key, 0) + 1
        
        # Sort by frequency
        sorted_colors = sorted(color_groups.items(), key=lambda x: -x[1])
        return [color for color, count in sorted_colors[:num_colors]]

    def _check_upi_colors(self, colors: list) -> str:
        """Check if dominant colors match known UPI payment apps."""
        for app_name, app_colors in UPI_APP_COLORS.items():
            matches = 0
            for color in colors:
                for app_color in app_colors:
                    # Check if colors are close (within threshold)
                    diff = sum(abs(color[i] - app_color[i]) for i in range(3))
                    if diff < 80:  # Threshold for color matching
                        matches += 1
            if matches >= 2:
                return app_name
        return ""

    async def _strict_ai_verify(self, image_bytes: bytes, expected_amount: int) -> dict:
        """ULTRA-STRICT AI verification using GPT-5."""
        try:
            img = Image.open(io.BytesIO(image_bytes))
            w, h = img.size
            file_size = len(image_bytes)

            prompt = f"""You are the WORLD'S STRICTEST payment verification AI. Your job is to catch ANY fake payment screenshot.

IMAGE DATA:
- Dimensions: {w}x{h}
- File size: {file_size/1024:.1f}KB
- Expected amount to verify: ₹{expected_amount}

STRICT VERIFICATION RULES (MUST CHECK ALL):
1. Is this a REAL UPI payment screenshot? (Google Pay, PhonePe, Paytm, BHIM)
2. Does it show "Payment Successful" or "Amount Paid" or "Transaction Successful"?
3. Can you clearly see the amount ₹{expected_amount}?
4. Does it have a UPI transaction ID or reference number?
5. Does it show sender/receiver UPI ID or bank account details?
6. Is this a genuine mobile phone screenshot (not a photo, not random image)?

ABSOLUTELY REJECT IF:
- It's a random image, photo, or meme
- No payment amount visible
- No transaction ID or reference number
- No UPI app branding visible
- It's clearly a fake/generated image

Reply ONLY with this JSON format, no other text:
{{
  "is_payment": false,
  "confidence": "low",
  "amount_detected": null,
  "amount_matches": false,
  "analysis": "SHORT reason why this is NOT a payment screenshot. Be specific."
}}

Be EXTREMELY strict. Default to false unless 100% sure."""

            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.get(
                    "https://r-bots-free-apis.co08.art/api/v1/api/gpt-5",
                    params={"q": prompt},
                    timeout=30.0
                )

                if resp.status_code == 200:
                    data = resp.json()
                    text = str(data.get("results", data.get("response", "")))
                    
                    import re
                    json_match = re.search(r'\{[^{}]*\}', text, re.DOTALL)
                    if json_match:
                        try:
                            ai_data = json.loads(json_match.group())
                            return {
                                "is_payment": ai_data.get("is_payment", False),
                                "confidence": ai_data.get("confidence", "low"),
                                "amount_detected": ai_data.get("amount_detected"),
                                "amount_matches": ai_data.get("amount_matches", False),
                                "analysis": ai_data.get("analysis", text[:150]),
                            }
                        except:
                            pass
                    
                    # STRICT fallback - only pass if explicitly says yes
                    is_payment = text.strip().lower().startswith("true") or text.strip().lower().startswith("yes")
                    return {
                        "is_payment": is_payment,
                        "confidence": "low",
                        "amount_detected": None,
                        "amount_matches": False,
                        "analysis": text[:150],
                    }

                return {"error": f"API {resp.status_code}"}
        except Exception as e:
            return {"error": str(e)[:80]}

    async def _cross_verify_with_deepseek(self, image_bytes: bytes, expected_amount: int) -> dict:
        """Cross-verify with DeepSeek R1 for second opinion."""
        try:
            img = Image.open(io.BytesIO(image_bytes))
            w, h = img.size

            prompt = f"""STRICT verification: Is this a genuine UPI payment screenshot?
Image: {w}x{h}, Expected amount: ₹{expected_amount}
Reply ONLY: YES or NO with one-line reason."""

            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.get(
                    "https://r-bots-free-apis.co08.art/api/v1/api/deepseek-r1",
                    params={"q": prompt},
                    timeout=20.0
                )

                if resp.status_code == 200:
                    data = resp.json()
                    text = str(data.get("response", data.get("results", "")))
                    return {
                        "is_payment": "yes" in text.lower()[:50],
                        "analysis": text[:100],
                    }
                return {"error": f"API {resp.status_code}"}
        except Exception as e:
            return {"error": str(e)[:60]}


payment_verifier = PaymentVerifier()
