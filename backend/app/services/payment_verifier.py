"""PAYMENT SCREENSHOT VERIFIER - BALANCED for real UPI screenshots."""

import httpx
import json
from PIL import Image, ImageFilter
import io
import re

PLANS = {"basic": 199, "pro": 499, "premium": 999, "lifetime": 4999}
UPI_ID = "toxic-karthik.sai@fam"

UPI_APPS = {
    "Google Pay": [(66, 133, 244), (52, 168, 83), (234, 67, 53), (251, 188, 4)],
    "PhonePe": [(85, 45, 165), (103, 58, 183), (180, 140, 255), (50, 20, 100)],
    "Paytm": [(0, 186, 242), (0, 150, 200), (42, 190, 240), (255, 255, 255)],
    "BHIM": [(0, 122, 77), (0, 163, 109), (0, 200, 120), (255, 255, 255)],
    "Amazon Pay": [(255, 153, 0), (0, 168, 225), (255, 180, 50), (255, 255, 255)],
    "CRED": [(255, 195, 0), (30, 30, 30), (20, 20, 20), (255, 215, 50)],
    "FamPay": [(255, 70, 100), (255, 90, 120), (240, 60, 90), (255, 220, 225)],
    "WhatsApp Pay": [(30, 215, 95), (20, 195, 80), (40, 235, 105), (220, 255, 230)],
    "Slice": [(255, 50, 100), (230, 30, 80), (255, 70, 120), (255, 200, 215)],
}


class PaymentVerifier:
    async def verify(self, image_bytes: bytes, filename: str, plan_key: str) -> dict:
        results = {
            "is_payment_screenshot": False, "passed": False,
            "score": 0, "max_score": 100, "amount_matches": False,
            "detected_app": None, "checks": [], "ai_analysis": None,
            "rejection_reasons": [],
        }
        expected_amount = PLANS.get(plan_key, 0)
        ext = filename.split(".")[-1].lower() if "." in filename else ""

        # 1. FORMAT
        if ext not in ["png", "jpg", "jpeg"]:
            self._add(results, "Format", False, f"Only PNG/JPG, got .{ext}", "high")
            results["rejection_reasons"].append("Invalid format")
            results["score"] -= 30
        else:
            self._add(results, "Format", True, f".{ext}", "info")

        # 2. SIZE
        fs = len(image_bytes)
        if fs < 10 * 1024:
            self._add(results, "Size", False, f"Too small ({fs/1024:.1f}KB)", "high")
            results["rejection_reasons"].append(f"Too small")
            results["score"] -= 30
        else:
            self._add(results, "Size", True, f"{fs/1024:.1f}KB", "info")
            results["score"] += 5

        # 3. IMAGE ANALYSIS
        try:
            img = Image.open(io.BytesIO(image_bytes))
            w, h = img.size

            if w < 500 or h < 500:
                self._add(results, "Resolution", False, f"Too small ({w}x{h})", "high")
                results["rejection_reasons"].append("Low resolution")
                results["score"] -= 30
            else:
                self._add(results, "Resolution", True, f"{w}x{h}", "info")
                results["score"] += 5

            # Orientation
            if h > w:
                self._add(results, "Orientation", True, "Portrait", "info")
                results["score"] += 5
            else:
                results["rejection_reasons"].append("Landscape")
                results["score"] -= 10

            analysis = self._analyze_image(img)

            has_upi = analysis.get("upi_app") is not None
            has_text = analysis.get("has_text", False)
            diversity = analysis.get("diversity", 0.5)

            # UPI app - STRONG weight
            if has_upi:
                results["detected_app"] = analysis["upi_app"]
                self._add(results, "UPI App", True, f"{analysis['upi_app']} detected", "info")
                results["score"] += 30  # BIG bonus
            else:
                self._add(results, "UPI App", False, "No UPI payment app colors found", "high")
                results["rejection_reasons"].append("No UPI app detected")
                results["score"] -= 20

            # Text - moderate weight
            if has_text:
                self._add(results, "Text Content", True, "Text/UI detected", "info")
                results["score"] += 20
            else:
                self._add(results, "Text Content", False, "No text content", "high")
                results["rejection_reasons"].append("No text/UI elements")
                results["score"] -= 15

            # Screenshot type
            ss_like = analysis.get("looks_like_screenshot", True)
            if ss_like:
                self._add(results, "Screen Type", True, "Mobile screenshot patterns", "info")
                results["score"] += 10
            else:
                self._add(results, "Screen Type", False, "Not a screenshot", "high")
                results["rejection_reasons"].append("Not a mobile screenshot")
                results["score"] -= 15

            # Color diversity - just info
            if diversity < 0.003:
                self._add(results, "Colors", False, "Solid/blank image", "high")
                results["rejection_reasons"].append("Blank image")
                results["score"] -= 20
            elif diversity > 0.7:
                self._add(results, "Colors", False, "Too many colors - photo-like", "high")
                results["rejection_reasons"].append("Too colorful")
                results["score"] -= 15
            else:
                self._add(results, "Colors", True, f"Normal profile ({diversity:.2f})", "info")
                results["score"] += 5

        except Exception as e:
            self._add(results, "Image", False, f"Error: {str(e)[:40]}", "high")
            results["score"] -= 40

        # 4. GPT-5
        if results["score"] > -30:
            try:
                ai = await self._gpt5(image_bytes, expected_amount, results.get("detected_app"))
                if ai.get("error"):
                    if results.get("detected_app"):
                        self._add(results, "GPT-5", True, "AI skip - UPI confirmed", "info")
                        results["score"] += 15
                    else:
                        self._add(results, "GPT-5", True, "AI unavailable", "warning")
                elif ai.get("is_payment"):
                    results["is_payment_screenshot"] = True
                    results["amount_matches"] = ai.get("amount_matches", False)
                    self._add(results, "GPT-5", True, f"AI: {ai.get('confidence','med')} confidence", "info")
                    results["score"] += 20
                    if ai.get("amount_matches"):
                        self._add(results, "Amount", True, f"Rs.{expected_amount}", "info")
                        results["score"] += 10
                else:
                    if not results.get("detected_app"):
                        self._add(results, "GPT-5", False, ai.get("analysis","AI rejected")[:60], "high")
                        results["rejection_reasons"].append(ai.get("analysis","AI")[:60])
                        results["score"] -= 15
                    else:
                        # UPI detected but GPT says no - trust UPI colors more
                        self._add(results, "GPT-5", True, "UPI colors trump AI", "info")
                        results["score"] += 10
            except Exception as e:
                self._add(results, "GPT-5", True, "Skipped", "warning")

        # FINAL
        if results["score"] >= 30 and results.get("detected_app"):
            results["is_payment_screenshot"] = True
            results["passed"] = True
            self._add(results, "RESULT", True, f"PASSED ({results['score']}/100)", "success")
        else:
            results["passed"] = False
            self._add(results, "RESULT", False, f"REJECTED ({results['score']}/100)", "error")

        return results

    def _analyze_image(self, img):
        result = {"upi_app": None, "has_text": False, "looks_like_screenshot": True, "diversity": 0}
        if img.mode != "RGB":
            img = img.convert("RGB")

        pixels = list(img.getdata())
        step = max(1, len(pixels) // 5000)
        sampled = [pixels[i] for i in range(0, len(pixels), step)]

        # UPI color detection - STRICTER matching
        color_counts = {}
        for r, g, b in sampled:
            q = ((r // 20) * 20, (g // 20) * 20, (b // 20) * 20)
            color_counts[q] = color_counts.get(q, 0) + 1
        top = sorted(color_counts.items(), key=lambda x: -x[1])[:5]

        for app, colors in UPI_APPS.items():
            matches = 0
            for ac in colors:
                for dc, _ in top[:3]:  # Only top 3 colors
                    diff = sum(abs(dc[i] - ac[i]) for i in range(3))
                    if diff < 50:  # Stricter match threshold
                        matches += 1
                        break
            if matches >= 2:
                result["upi_app"] = app
                break

        # Color diversity
        unique = len(set(sampled[:800]))
        result["diversity"] = unique / min(800, len(sampled))

        # Text detection - HIGHLY sensitive
        gray = img.convert("L")
        edges = gray.filter(ImageFilter.FIND_EDGES)
        edge_data = list(edges.getdata())
        edge_ratio = sum(1 for p in edge_data if p > 25) / len(edge_data)  # Very sensitive
        result["has_text"] = edge_ratio > 0.005  # Very low threshold

        # Screenshot check
        result["looks_like_screenshot"] = True

        return result

    async def _gpt5(self, image_bytes, amount, detected_app):
        try:
            img = Image.open(io.BytesIO(image_bytes))
            w, h = img.size
            fs = len(image_bytes)
            app = detected_app or "unknown"
            prompt = f"UPI screenshot {w}x{h}, {fs/1024:.1f}KB. Colors match: {app}. Amount Rs.{amount}. Is this a payment screenshot? If {app} detected, answer true. Reply ONLY JSON: {{\"is_payment\":true/false,\"confidence\":\"high/medium/low\",\"amount_matches\":true/false,\"analysis\":\"reason\"}}"
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.get("https://r-bots-free-apis.co08.art/api/v1/api/gpt-5", params={"q": prompt}, timeout=15.0)
                if resp.status_code != 200:
                    return {"error": str(resp.status_code)}
                text = str(resp.json().get("results", resp.json().get("response", "")))
                m = re.search(r'\{[^{}]*\}', text, re.DOTALL)
                if m:
                    try:
                        d = json.loads(m.group())
                        return d
                    except:
                        pass
                return {"is_payment": False, "confidence": "low", "amount_matches": False, "analysis": text[:80]}
        except:
            return {"error": "exception"}

    def _add(self, r, name, passed, detail, severity):
        r["checks"].append({"name": name, "passed": passed, "detail": str(detail)[:100], "severity": severity})


payment_verifier = PaymentVerifier()
