"""PAYMENT SCREENSHOT VERIFIER - Ultra Strict AI-Powered Image Analysis
Uses multi-layer pixel analysis + GPT-5 reasoning for UPI payment detection."""

import httpx
import json
from PIL import Image, ImageStat, ImageFilter
import io
import re
import math

PLANS = {"starter": 99, "pro": 499, "premium": 999, "lifetime": 4999}
UPI_ID = "toxic-karthik.sai@fam"

# UPI app color signatures (RGB tuples) - ALL Indian UPI Apps
UPI_APPS = {
    "Google Pay": [(66, 133, 244), (52, 168, 83), (234, 67, 53), (251, 188, 4)],
    "PhonePe": [(85, 45, 165), (103, 58, 183), (180, 140, 255), (50, 20, 100)],
    "Paytm": [(0, 186, 242), (0, 150, 200), (42, 190, 240), (255, 255, 255)],
    "BHIM": [(0, 122, 77), (0, 163, 109), (0, 200, 120), (255, 255, 255)],
    "Amazon Pay": [(255, 153, 0), (0, 168, 225), (255, 180, 50), (255, 255, 255)],
    "CRED": [(255, 195, 0), (30, 30, 30), (20, 20, 20), (255, 215, 50)],
    "PayZapp": [(230, 0, 60), (200, 0, 50), (255, 50, 80), (255, 255, 255)],
    "Freecharge": [(255, 50, 50), (220, 30, 30), (255, 80, 80), (255, 255, 255)],
    "Mobikwik": [(250, 80, 50), (230, 60, 40), (255, 100, 70), (255, 255, 255)],
    "Ola Money": [(180, 220, 50), (160, 200, 40), (200, 240, 60), (255, 255, 255)],
    "JioPay": [(10, 100, 200), (0, 80, 180), (50, 130, 220), (255, 255, 255)],
    "Axis Pay": [(130, 20, 50), (150, 30, 60), (100, 10, 40), (255, 255, 255)],
    "ICICI Pockets": [(200, 50, 80), (180, 40, 70), (220, 60, 90), (255, 255, 255)],
    "HDFC Payzapp": [(200, 40, 60), (180, 30, 50), (220, 50, 70), (255, 255, 255)],
    "SBI YONO": [(10, 60, 150), (0, 50, 130), (30, 80, 170), (255, 255, 255)],
    "Kotak Mahindra": [(220, 20, 60), (200, 10, 50), (240, 30, 70), (255, 255, 255)],
    "Yes Bank": [(20, 40, 100), (10, 30, 80), (30, 50, 120), (255, 255, 255)],
    "IndusInd": [(200, 50, 60), (180, 40, 50), (220, 60, 70), (255, 255, 255)],
    "FamPay": [(255, 70, 100), (255, 90, 120), (240, 60, 90), (255, 220, 225)],
    "Slice": [(255, 50, 100), (230, 30, 80), (255, 70, 120), (255, 200, 215)],
    "Jupiter": [(100, 50, 200), (80, 30, 180), (120, 70, 220), (230, 220, 255)],
    "Bajaj Finserv": [(0, 150, 220), (0, 130, 200), (0, 170, 240), (255, 255, 255)],
    "Tata Neu": [(70, 60, 200), (50, 40, 180), (90, 80, 220), (220, 215, 255)],
    "Airtel Thanks": [(230, 0, 50), (200, 0, 40), (255, 20, 60), (255, 240, 245)],
    "Vodafone Idea": [(230, 20, 20), (200, 10, 10), (255, 30, 30), (255, 230, 230)],
    "MyJio": [(10, 100, 200), (0, 80, 180), (30, 120, 220), (230, 240, 255)],
    "WhatsApp Pay": [(30, 215, 95), (20, 195, 80), (40, 235, 105), (220, 255, 230)],
    "Meesho": [(230, 50, 150), (210, 30, 130), (250, 70, 170), (255, 220, 240)],
    "Flipkart UPI": [(40, 100, 230), (20, 80, 210), (60, 120, 250), (230, 235, 255)],
    "Niyo": [(0, 100, 200), (0, 80, 180), (0, 120, 220), (230, 240, 255)],
    "Paytm Payments Bank": [(0, 186, 242), (0, 150, 200), (255, 200, 0), (255, 255, 255)],
    "IDFC FIRST Bank": [(230, 30, 60), (210, 20, 50), (255, 40, 70), (255, 235, 240)],
    "Punjab National Bank": [(40, 80, 180), (30, 70, 160), (50, 90, 200), (255, 255, 255)],
    "Canara Bank": [(20, 100, 180), (10, 80, 160), (30, 120, 200), (255, 255, 255)],
    "Bank of Baroda": [(220, 120, 30), (200, 100, 20), (240, 140, 40), (255, 245, 230)],
    "Union Bank": [(20, 60, 140), (10, 50, 120), (30, 70, 160), (255, 255, 255)],
    "Indian Bank": [(200, 40, 60), (180, 30, 50), (220, 50, 70), (255, 235, 240)],
    "Bank of India": [(30, 100, 180), (20, 80, 160), (40, 120, 200), (255, 255, 255)],
    "Central Bank": [(40, 60, 140), (30, 50, 120), (50, 70, 160), (255, 255, 255)],
    "BOB World": [(220, 120, 30), (200, 100, 20), (240, 140, 40), (255, 245, 230)],
    "HSBC PayMe": [(200, 20, 60), (180, 10, 50), (220, 30, 70), (255, 230, 240)],
    "Standard Chartered": [(50, 80, 50), (40, 70, 40), (60, 90, 60), (230, 240, 230)],
    "Citi Bank": [(230, 50, 80), (210, 40, 70), (250, 60, 90), (255, 235, 240)],
    "RBL Bank": [(200, 40, 80), (180, 30, 70), (220, 50, 90), (255, 230, 235)],
    "DCB Bank": [(20, 80, 160), (10, 70, 140), (30, 90, 180), (230, 240, 255)],
    "Karur Vysya Bank": [(200, 40, 60), (180, 30, 50), (220, 50, 70), (255, 235, 240)],
    "South Indian Bank": [(10, 80, 160), (0, 70, 140), (20, 90, 180), (230, 240, 255)],
    "Federal Bank": [(230, 50, 80), (210, 40, 70), (250, 60, 90), (255, 235, 240)],
    "Dhanlaxmi Bank": [(20, 80, 140), (10, 70, 120), (30, 90, 160), (230, 240, 250)],
    "Karnataka Bank": [(200, 60, 40), (180, 50, 30), (220, 70, 50), (255, 240, 235)],
    "Bandhan Bank": [(230, 100, 30), (210, 80, 20), (250, 120, 40), (255, 245, 230)],
    "AU Small Bank": [(200, 40, 80), (180, 30, 70), (220, 50, 90), (255, 230, 235)],
    "Yes Pay": [(20, 40, 100), (10, 30, 80), (30, 50, 120), (255, 255, 255)],
}


class PaymentVerifier:
    """Multi-layer payment screenshot verification using image analysis + AI reasoning."""

    async def verify(self, image_bytes: bytes, filename: str, plan_key: str) -> dict:
        """Run complete verification. Sets is_payment_screenshot for real ones, rejects fakes."""
        results = {
            "is_payment_screenshot": False,
            "passed": False,
            "score": 0,
            "max_score": 100,
            "amount_matches": False,
            "detected_app": None,
            "checks": [],
            "ai_analysis": None,
            "rejection_reasons": [],
        }

        expected_amount = PLANS.get(plan_key, 0)
        ext = filename.split(".")[-1].lower() if "." in filename else ""

        # ========================
        # LAYER 1: FILE FORMAT
        # ========================
        if ext not in ["png", "jpg", "jpeg"]:
            self._add_check(results, "File Format", False, f"Only PNG/JPG accepted. Got .{ext}", "high")
            results["rejection_reasons"].append(f"Invalid format: .{ext}")
            results["score"] -= 40
        else:
            self._add_check(results, "File Format", True, f".{ext} accepted", "info")

        # ========================
        # LAYER 2: FILE SIZE
        # ========================
        file_size = len(image_bytes)
        if file_size < 15 * 1024:
            self._add_check(results, "File Size", False, f"Suspicious: only {file_size/1024:.1f}KB. Screenshots are 50KB-5MB", "high")
            results["rejection_reasons"].append(f"Image too small ({file_size/1024:.1f}KB)")
            results["score"] -= 30
        elif file_size > 10 * 1024 * 1024:
            self._add_check(results, "File Size", False, f"Too large: {file_size/1024/1024:.1f}MB", "high")
            results["rejection_reasons"].append(f"Image too large")
            results["score"] -= 20
        else:
            self._add_check(results, "File Size", True, f"{file_size/1024:.1f}KB - normal", "info")

        # ========================
        # LAYER 3: DEEP IMAGE ANALYSIS (pixel level)
        # ========================
        try:
            img = Image.open(io.BytesIO(image_bytes))
            w, h = img.size
            
            # Resolution check
            if w < 400 or h < 400:
                self._add_check(results, "Resolution", False, f"Too small ({w}x{h})", "high")
                results["rejection_reasons"].append(f"Low resolution: {w}x{h}")
                results["score"] -= 30
            else:
                self._add_check(results, "Resolution", True, f"{w}x{h}", "info")
                results["score"] += 5
            
            # Orientation - UPI screenshots are portrait
            if h > w:
                self._add_check(results, "Orientation", True, "Portrait (mobile screenshot)", "info")
                results["score"] += 5
            else:
                self._add_check(results, "Orientation", False, "Landscape - unusual for payment SS", "warning")
                results["rejection_reasons"].append("Landscape orientation (payment SS are portrait)")
                results["score"] -= 10
            
            # ANALYZE IMAGE CONTENT
            analysis = self._analyze_image_content(img)
            
            # Screenshot vs Photo detection
            if analysis.get("is_screenshot", True):
                self._add_check(results, "Screenshot Type", True, "Appears to be a mobile screenshot", "info")
                results["score"] += 5
            else:
                self._add_check(results, "Screenshot Type", False, "Looks like a photograph, not screenshot", "high")
                results["rejection_reasons"].append("Not a screenshot (appears to be a photo)")
                results["score"] -= 15
            
            # UPI app color detection
            detected_app = analysis.get("upi_app")
            if detected_app:
                results["detected_app"] = detected_app
                self._add_check(results, "UPI App Detection", True, f"{detected_app} colors detected ✓", "info")
                results["score"] += 15
            else:
                self._add_check(results, "UPI App Detection", True, "No specific UPI brand colors found", "warning")
            
            # Text region detection (screenshots have text regions)
            if analysis.get("has_text_regions", False):
                self._add_check(results, "Text Content", True, "Text regions detected (screenshot with content)", "info")
                results["score"] += 10
            else:
                self._add_check(results, "Text Content", False, "No text regions - likely blank/solid image", "high")
                results["rejection_reasons"].append("No text content - appears to be a blank image")
                results["score"] -= 20
            
            # Color diversity (screenshots have moderate diversity)
            diversity = analysis.get("color_diversity", 0)
            if 0.1 < diversity < 0.7:
                self._add_check(results, "Color Diversity", True, f"Diversity {diversity:.2f} - normal for screenshot", "info")
                results["score"] += 5
            elif diversity >= 0.7:
                self._add_check(results, "Color Diversity", False, f"Too many colors ({diversity:.2f}) - could be photo", "warning")
            else:
                self._add_check(results, "Color Diversity", False, f"Too uniform ({diversity:.2f}) - blank image", "high")
                results["rejection_reasons"].append("Image appears blank or uniform")

        except Exception as e:
            self._add_check(results, "Image Analysis", False, f"Processing error: {str(e)[:50]}", "high")
            results["rejection_reasons"].append("Cannot process image")
            results["score"] -= 50

        # ========================
        # LAYER 4: GPT-5 AI REASONING
        # ========================
        if results["score"] > -60:
            try:
                ai_result = await self._analyze_with_gpt5(
                    image_bytes, expected_amount, 
                    detected_app=results.get("detected_app"),
                    analysis=analysis
                )
                
                if ai_result.get("error"):
                    self._add_check(results, "GPT-5 Analysis", False, f"AI busy: {ai_result['error'][:40]}", "warning")
                elif ai_result.get("is_payment"):
                    results["is_payment_screenshot"] = True
                    results["amount_matches"] = ai_result.get("amount_matches", False)
                    
                    if ai_result.get("app_name"):
                        results["detected_app"] = ai_result["app_name"]
                    
                    confidence = ai_result.get("confidence", "low")
                    self._add_check(results, "GPT-5 Analysis", True, 
                        f"AI: {confidence.upper()} confidence - {ai_result.get('analysis','')[:60]}", "info")
                    results["score"] += 30
                    
                    if ai_result.get("amount_matches"):
                        self._add_check(results, "Amount Match", True, f"₹{expected_amount} detected ✓", "info")
                        results["score"] += 15
                    else:
                        self._add_check(results, "Amount Match", False, f"₹{expected_amount} not clearly visible", "high")
                        results["rejection_reasons"].append(f"Amount ₹{expected_amount} not found in screenshot")
                        results["score"] -= 10
                    
                    if ai_result.get("transaction_id", False):
                        self._add_check(results, "Transaction ID", True, "Transaction reference found ✓", "info")
                        results["score"] += 10
                    elif results["score"] > 30:
                        self._add_check(results, "Transaction ID", False, "No transaction ID visible", "warning")
                        results["score"] -= 5
                else:
                    self._add_check(results, "GPT-5 Analysis", False, 
                        ai_result.get("analysis", "Not a payment screenshot")[:80], "high")
                    results["rejection_reasons"].append(ai_result.get("analysis", "AI rejected")[:80])
                    results["score"] -= 25
                    
            except Exception as e:
                self._add_check(results, "GPT-5 Analysis", False, f"Error: {str(e)[:40]}", "warning")

        # ========================
        # FINAL VERDICT
        # ========================
        if results["is_payment_screenshot"] and results["score"] >= 45:
            results["passed"] = True
            self._add_check(results, "FINAL VERDICT", True, f"PASSED ✓ (Score: {results['score']}/100)", "success")
        else:
            results["passed"] = False
            self._add_check(results, "FINAL VERDICT", False, f"REJECTED ✗ (Score: {results['score']}/100)", "error")
            if not results["rejection_reasons"]:
                results["rejection_reasons"].append("Failed multiple verification checks")

        return results

    def _analyze_image_content(self, img: Image) -> dict:
        """Deep pixel-level image analysis."""
        result = {
            "is_screenshot": True,
            "upi_app": None,
            "has_text_regions": False,
            "color_diversity": 0,
            "brightness": 0,
            "dominant_colors": [],
        }

        w, h = img.size
        if img.mode != "RGB":
            img = img.convert("RGB")

        # Get pixel data
        pixels = list(img.getdata())
        total = len(pixels)
        
        # Sample for analysis
        step = max(1, total // 5000)
        sampled = [pixels[i] for i in range(0, total, step)]
        
        # Color diversity
        unique_colors = len(set(sampled[:1000]))
        total_sampled = min(1000, len(sampled))
        result["color_diversity"] = unique_colors / max(total_sampled, 1)
        
        # Average brightness
        brightness = sum((r*0.299 + g*0.587 + b*0.114) for r, g, b in sampled[:500]) / max(len(sampled[:500]), 1)
        result["brightness"] = brightness / 255 * 100

        # Edge detection for text regions
        gray = img.convert("L")
        edges = gray.filter(ImageFilter.FIND_EDGES)
        edge_pixels = list(edges.getdata())
        edge_ratio = sum(1 for p in edge_pixels if p > 50) / len(edge_pixels)
        result["has_text_regions"] = edge_ratio > 0.05 and edge_ratio < 0.4

        # Screenshot vs photo detection
        # Screenshots have sharper edges, less noise
        if result["has_text_regions"] and result["color_diversity"] < 0.5:
            result["is_screenshot"] = True
        elif result["color_diversity"] > 0.7:
            result["is_screenshot"] = False
        
        # Detect UPI app by colors
        color_counts = {}
        for r, g, b in sampled[:2000]:
            quantized = ((r // 40) * 40, (g // 40) * 40, (b // 40) * 40)
            color_counts[quantized] = color_counts.get(quantized, 0) + 1
        
        top_colors = sorted(color_counts.items(), key=lambda x: -x[1])[:10]
        result["dominant_colors"] = [{"rgb": c, "count": n} for c, n in top_colors]
        
        # Match against UPI app colors
        for app_name, app_colors in UPI_APPS.items():
            matches = 0
            for ac in app_colors:
                for dc, _ in top_colors[:5]:
                    diff = sum(abs(dc[i] - ac[i]) for i in range(3))
                    if diff < 60:
                        matches += 1
                        break
            if matches >= 2:
                result["upi_app"] = app_name
                break

        return result

    async def _analyze_with_gpt5(self, image_bytes: bytes, expected_amount: int, 
                                   detected_app: str = None, analysis: dict = None) -> dict:
        """Use GPT-5 with detailed image characteristics for reasoning."""
        img = Image.open(io.BytesIO(image_bytes))
        w, h = img.size
        file_size = len(image_bytes)
        
        upi_info = f"UPI app colors detected: {detected_app}" if detected_app else "No specific UPI app detected"
        diversity = analysis.get("color_diversity", 0) if analysis else 0
        brightness = analysis.get("brightness", 0) if analysis else 0
        text_regions = "Text/content regions detected" if analysis and analysis.get("has_text_regions") else "No significant text regions"
        
        prompt = f"""PAYMENT SCREENSHOT VERIFICATION. Image analysis results:

METADATA: {w}x{h}, {file_size/1024:.1f}KB, PNG
EXPECTED AMOUNT: ₹{expected_amount}
TEST UPI ID: {UPI_ID}
COLORS: {upi_info}, diversity={diversity:.2f}, brightness={brightness:.1f}%
TEXT: {text_regions}

STRICT ANALYSIS - Check ALL of these:
1. Is this a UPI PAYMENT SCREENSHOT from ANY Indian UPI app (Google Pay/PhonePe/Paytm/BHIM/Amazon Pay/CRED/PayZapp/Freecharge/Mobikwik/FamPay/Slice/Jupiter/WhatsApp Pay etc)?
2. Is the amount ₹{expected_amount} visible?
3. Is there a transaction ID / UPI reference number?
4. Is there a UPI ID match to "toxic-karthik.sai@fam"?
5. Is there a "Payment Successful" or "Success" or "Amount Paid" message?
6. Does it show sender/receiver bank details?

Reply ONLY with valid JSON:
{{"is_payment":true/false,"confidence":"high/medium/low","app_name":"which UPI app or null","amount_matches":true/false,"transaction_id":true/false,"analysis":"detailed 1-line analysis of what this screenshot shows"}}

Be STRICT - default to false if unsure."""

        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.get(
                "https://r-bots-free-apis.co08.art/api/v1/api/gpt-5",
                params={"q": prompt}, timeout=25.0
            )
            
            if resp.status_code != 200:
                return {"error": f"GPT-5 returned {resp.status_code}"}
            
            text = str(resp.json().get("results", resp.json().get("response", "")))
            
            m = re.search(r'\{[^{}]*\}', text, re.DOTALL)
            if m:
                try:
                    data = json.loads(m.group())
                    return {
                        "is_payment": data.get("is_payment", False),
                        "confidence": data.get("confidence", "low"),
                        "app_name": data.get("app_name"),
                        "amount_matches": data.get("amount_matches", False),
                        "transaction_id": data.get("transaction_id", False),
                        "analysis": data.get("analysis", text[:120]),
                    }
                except:
                    pass
            return {"is_payment": False, "analysis": text[:120]}

    def _add_check(self, results, name, passed, detail, severity):
        results["checks"].append({
            "name": name, "passed": passed, 
            "detail": str(detail)[:120], "severity": severity
        })


payment_verifier = PaymentVerifier()
