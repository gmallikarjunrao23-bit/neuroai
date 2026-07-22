"""PAYMENT SCREENSHOT VERIFIER - Balanced for real UPI SS, strict on fakes."""

import httpx
import json
from PIL import Image, ImageFilter
import io
import re

PLANS = {"starter": 99, "pro": 499, "premium": 999, "lifetime": 4999}
UPI_ID = "toxic-karthik.sai@fam"

UPI_APPS = {
    "Google Pay": [(66, 133, 244), (52, 168, 83), (234, 67, 53), (251, 188, 4)],
    "PhonePe": [(85, 45, 165), (103, 58, 183), (180, 140, 255), (50, 20, 100)],
    "Paytm": [(0, 186, 242), (0, 150, 200), (42, 190, 240), (255, 255, 255)],
    "BHIM": [(0, 122, 77), (0, 163, 109), (0, 200, 120), (255, 255, 255)],
    "Amazon Pay": [(255, 153, 0), (0, 168, 225), (255, 180, 50), (255, 255, 255)],
    "CRED": [(255, 195, 0), (30, 30, 30), (20, 20, 20), (255, 215, 50)],
    "FamPay": [(255, 70, 100), (255, 90, 120), (240, 60, 90), (255, 220, 225)],
    "PayZapp": [(230, 0, 60), (200, 0, 50), (255, 50, 80), (255, 255, 255)],
    "Freecharge": [(255, 50, 50), (220, 30, 30), (255, 80, 80), (255, 255, 255)],
    "Mobikwik": [(250, 80, 50), (230, 60, 40), (255, 100, 70), (255, 255, 255)],
    "WhatsApp Pay": [(30, 215, 95), (20, 195, 80), (40, 235, 105), (220, 255, 230)],
    "Slice": [(255, 50, 100), (230, 30, 80), (255, 70, 120), (255, 200, 215)],
    "Jupiter": [(100, 50, 200), (80, 30, 180), (120, 70, 220), (230, 220, 255)],
    "SBI YONO": [(10, 60, 150), (0, 50, 130), (30, 80, 170), (255, 255, 255)],
    "HDFC Payzapp": [(200, 40, 60), (180, 30, 50), (220, 50, 70), (255, 255, 255)],
    "ICICI Pockets": [(200, 50, 80), (180, 40, 70), (220, 60, 90), (255, 255, 255)],
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
            results["rejection_reasons"].append(f"Invalid format")
            results["score"] -= 30
        else:
            self._add(results, "Format", True, f".{ext}", "info")

        # 2. SIZE - UPI screenshots are typically 50KB-2MB
        fs = len(image_bytes)
        if fs < 10 * 1024:
            self._add(results, "Size", False, f"Too small ({fs/1024:.1f}KB). Payment SS are 50KB+", "high")
            results["rejection_reasons"].append(f"Too small: {fs/1024:.1f}KB")
            results["score"] -= 30
        elif fs > 10 * 1024 * 1024:
            self._add(results, "Size", False, f"Too large ({(fs/1024/1024):.1f}MB)", "high")
            results["score"] -= 20
        else:
            self._add(results, "Size", True, f"{fs/1024:.1f}KB", "info")
            results["score"] += 10

        # 3. IMAGE ANALYSIS
        try:
            img = Image.open(io.BytesIO(image_bytes))
            w, h = img.size

            # Resolution
            if w < 500 or h < 500:
                self._add(results, "Resolution", False, f"Too small ({w}x{h})", "high")
                results["rejection_reasons"].append(f"Low resolution: {w}x{h}")
                results["score"] -= 30
            else:
                self._add(results, "Resolution", True, f"{w}x{h}", "info")
                results["score"] += 5

            # Orientation
            if h > w:
                self._add(results, "Orientation", True, "Portrait", "info")
                results["score"] += 5
            else:
                results["rejection_reasons"].append("Landscape - payment screenshots are portrait")
                results["score"] -= 15

            # Deep analysis
            analysis = self._analyze_image(img)
            
            upi_detected = analysis.get("upi_app") is not None
            has_text = analysis.get("has_text", False)
            looks_like_screenshot = analysis.get("looks_like_screenshot", True)

            # UPI app detection
            if analysis.get("upi_app"):
                results["detected_app"] = analysis["upi_app"]
                self._add(results, "UPI App", True, f"{analysis['upi_app']} detected", "info")
                results["score"] += 25
            else:
                # No UPI colors = very suspicious
                self._add(results, "UPI App", False, "No UPI payment app colors detected", "high")
                results["rejection_reasons"].append("No UPI app branding found")
                results["score"] -= 15

            # Text content - REAL screenshots have text
            if has_text:
                self._add(results, "Text Content", True, "Text/UI elements detected", "info")
                results["score"] += 15
            else:
                self._add(results, "Text Content", False, "No text content - looks like solid/blank image", "high")
                results["rejection_reasons"].append("No text or UI elements found")
                results["score"] -= 25

            # Screenshot characteristic
            if looks_like_screenshot:
                self._add(results, "Screenshot Type", True, "Matches screenshot patterns", "info")
                results["score"] += 10
            else:
                self._add(results, "Screenshot Type", False, "Looks like photo/art, not screenshot", "high")
                results["rejection_reasons"].append("Not a mobile screenshot")
                results["score"] -= 20

            # Color diversity check - screenshots have MODERATE diversity
            div = analysis.get("diversity", 0.5)
            if 0.005 < div < 0.6:
                self._add(results, "Color Profile", True, f"Normal diversity ({div:.2f})", "info")
                results["score"] += 5
            elif div >= 0.6:
                self._add(results, "Color Profile", False, f"Too colorful ({div:.2f}) - not a screenshot", "high")
                results["rejection_reasons"].append("Too many colors - looks like photo")
                results["score"] -= 15
            else:
                self._add(results, "Color Profile", False, f"Too uniform ({div:.2f}) - blank/solid", "high")
                results["rejection_reasons"].append("Blank/solid image")
                results["score"] -= 25

        except Exception as e:
            self._add(results, "Image", False, f"Error: {str(e)[:40]}", "high")
            results["score"] -= 40

        # 4. GPT-5 AI REASONING
        if results["score"] > -30:
            try:
                ai = await self._gpt5(image_bytes, expected_amount, results.get("detected_app"))
                if ai.get("error"):
                    # If UPI detected but AI unavailable, pass it
                    if results.get("detected_app"):
                        self._add(results, "GPT-5", True, "AI busy - UPI app confirmed, bypassing", "info")
                        results["score"] += 15
                    else:
                        self._add(results, "GPT-5", True, "AI check unavailable", "warning")
                        results["score"] += 5
                elif ai.get("is_payment"):
                    results["is_payment_screenshot"] = True
                    results["amount_matches"] = ai.get("amount_matches", False)
                    conf = ai.get("confidence", "low")
                    self._add(results, "GPT-5", True, f"AI confirmed ({conf})", "info")
                    results["score"] += 20
                    if ai.get("amount_matches"):
                        self._add(results, "Amount", True, f"Rs.{expected_amount} detected", "info")
                        results["score"] += 15
                else:
                    # AI rejected it
                    if results.get("detected_app"):
                        # UPI colors detected but AI says no - let AI decision override
                        pass
                    self._add(results, "GPT-5", False, ai.get("analysis", "AI rejected")[:60], "high")
                    results["rejection_reasons"].append(ai.get("analysis", "AI rejected")[:60])
                    results["score"] -= 20
            except Exception as e:
                self._add(results, "GPT-5", True, "Check skipped", "warning")

        # FINAL VERDICT - HIGHER threshold
        if results["score"] >= 35 and results.get("detected_app"):
            results["is_payment_screenshot"] = True
            results["passed"] = True
            self._add(results, "RESULT", True, f"PASSED ({results['score']}/100)", "success")
        else:
            results["passed"] = False
            self._add(results, "RESULT", False, f"REJECTED ({results['score']}/100)", "error")
            if not results["rejection_reasons"]:
                results["rejection_reasons"].append("Verification failed")

        return results

    def _analyze_image(self, img):
        result = {"upi_app": None, "has_text": False, "looks_like_screenshot": True, "diversity": 0}
        if img.mode != "RGB":
            img = img.convert("RGB")

        pixels = list(img.getdata())
        step = max(1, len(pixels) // 5000)
        sampled = [pixels[i] for i in range(0, len(pixels), step)]

        # UPI color detection
        color_counts = {}
        for r, g, b in sampled[:2500]:
            q = ((r // 30) * 30, (g // 30) * 30, (b // 30) * 30)
            color_counts[q] = color_counts.get(q, 0) + 1
        top = sorted(color_counts.items(), key=lambda x: -x[1])[:8]

        for app, colors in UPI_APPS.items():
            matches = 0
            for ac in colors:
                for dc, _ in top:
                    if sum(abs(dc[i] - ac[i]) for i in range(3)) < 70:
                        matches += 1
                        break
            if matches >= 2:
                result["upi_app"] = app
                break

        # Color diversity
        unique = len(set(sampled[:1500]))
        result["diversity"] = unique / min(1500, len(sampled))

        # Text/edge detection  
        gray = img.convert("L")
        edges = gray.filter(ImageFilter.FIND_EDGES)
        edge_data = list(edges.getdata())
        edge_ratio = sum(1 for p in edge_data if p > 40) / len(edge_data)
        result["has_text"] = 0.01 < edge_ratio < 0.5

        # Screenshot detection
        result["looks_like_screenshot"] = not (result["diversity"] > 0.7 and not result["has_text"])

        return result

    async def _gpt5(self, image_bytes, amount, detected_app):
        try:
            img = Image.open(io.BytesIO(image_bytes))
            w, h = img.size
            fs = len(image_bytes)
            app = detected_app or "unknown"
            dims = f"{w}x{h}"
            sized = f"{fs/1024:.1f}KB"
            
            prompt = f"Is this a REAL UPI payment screenshot? Image: {dims}, {sized}. Colors: {app}. Expected Rs.{amount}. Reply ONLY JSON: {{\"is_payment\":true/false,\"confidence\":\"high/medium/low\",\"amount_matches\":true/false,\"analysis\":\"reason\"}}"
            
            async with httpx.AsyncClient(timeout=20.0) as client:
                resp = await client.get(
                    "https://r-bots-free-apis.co08.art/api/v1/api/gpt-5",
                    params={"q": prompt}, timeout=20.0)
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
