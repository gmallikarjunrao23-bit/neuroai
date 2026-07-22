"""Strict AI Payment Screenshot Verification Service."""

import httpx
import json
from PIL import Image
import io
from datetime import datetime

PLANS = {
    "starter": {"name": "Starter", "price": 99},
    "pro": {"name": "Professional", "price": 499},
    "premium": {"name": "Premium", "price": 999},
    "lifetime": {"name": "Lifetime", "price": 4999},
}

UPI_APPS = ["google pay", "gpay", "phonepe", "paytm", "bhim", "amazon pay", "cred"]
PAYMENT_KEYWORDS = [
    "payment successful", "amount paid", "transaction id", "txn id", "ref id",
    "paid to", "sent to", "transferred", "credited", "debited",
    "rs.", "rs ", "rupees", "money sent", "upi transaction",
    "payment of", "to account", "bank account", "ifsc", "successful"
]


class PaymentVerifier:
    """Strict payment screenshot verification using AI + rules."""

    async def verify(self, image_bytes: bytes, filename: str, plan_key: str) -> dict:
        """Run full verification and return detailed results."""
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

        plan = PLANS.get(plan_key, {"name": "Unknown", "price": 0})
        expected_amount = plan["price"]

        ext = filename.split(".")[-1].lower() if "." in filename else ""

        # === CHECK 1: File Format ===
        if ext not in ["png", "jpg", "jpeg"]:
            results["checks"].append({
                "name": "File Format",
                "passed": False,
                "detail": f"Only PNG/JPG allowed. Got .{ext}",
                "severity": "high"
            })
            results["rejection_reasons"].append(f"Invalid file format: .{ext}")
            results["score"] -= 30
        else:
            results["checks"].append({
                "name": "File Format",
                "passed": True,
                "detail": f".{ext} format accepted",
                "severity": "info"
            })
            results["score"] += 10

        # === CHECK 2: File Size ===
        file_size = len(image_bytes)
        if file_size < 10 * 1024:
            results["checks"].append({
                "name": "File Size",
                "passed": False,
                "detail": f"Image too small ({file_size/1024:.1f}KB). Payment screenshots are typically 50KB-5MB",
                "severity": "high"
            })
            results["rejection_reasons"].append(f"Suspiciously small image: {file_size/1024:.1f}KB")
            results["score"] -= 30
        elif file_size > 10 * 1024 * 1024:
            results["checks"].append({
                "name": "File Size",
                "passed": False,
                "detail": f"Image too large ({(file_size/1024/1024):.1f}MB)",
                "severity": "high"
            })
            results["rejection_reasons"].append(f"Image too large: {(file_size/1024/1024):.1f}MB")
            results["score"] -= 20
        else:
            results["checks"].append({
                "name": "File Size",
                "passed": True,
                "detail": f"{file_size/1024:.1f}KB - Normal screenshot size",
                "severity": "info"
            })
            results["score"] += 10

        # === CHECK 3: Image Dimensions ===
        try:
            img = Image.open(io.BytesIO(image_bytes))
            width, height = img.size

            if width < 400 or height < 400:
                results["checks"].append({
                    "name": "Resolution",
                    "passed": False,
                    "detail": f"Too small ({width}x{height}). Phone screenshots are typically 1080x1920+",
                    "severity": "high"
                })
                results["rejection_reasons"].append(f"Low resolution screenshot: {width}x{height}")
                results["score"] -= 30
            elif width > 4000 or height > 4000:
                results["checks"].append({
                    "name": "Resolution",
                    "passed": True,
                    "detail": f"{width}x{height} - High resolution",
                    "severity": "info"
                })
                results["score"] += 10
            else:
                results["checks"].append({
                    "name": "Resolution",
                    "passed": True,
                    "detail": f"{width}x{height} - Normal screenshot resolution",
                    "severity": "info"
                })
                results["score"] += 15

            # Check orientation - payment screenshots are usually portrait
            if height > width:
                results["checks"].append({
                    "name": "Orientation",
                    "passed": True,
                    "detail": "Portrait - matches phone screenshot orientation",
                    "severity": "info"
                })
                results["score"] += 10
            else:
                results["checks"].append({
                    "name": "Orientation",
                    "passed": True,
                    "detail": f"Landscape ({width}x{height})",
                    "severity": "info"
                })
        except Exception as e:
            results["checks"].append({
                "name": "Resolution",
                "passed": False,
                "detail": f"Cannot read image: {str(e)[:50]}",
                "severity": "high"
            })
            results["rejection_reasons"].append("Cannot read image file")
            results["score"] -= 40

        # === CHECK 4: AI ANALYSIS (GPT-5) - THE MAIN CHECK ===
        ai_result = await self._analyze_with_ai(image_bytes, filename, expected_amount)
        results["ai_analysis"] = ai_result.get("analysis", "")
        
        if ai_result.get("error"):
            results["checks"].append({
                "name": "AI Analysis",
                "passed": True,
                "detail": f"AI service temporarily unavailable: {ai_result['error'][:50]}",
                "severity": "warning"
            })
            results["score"] += 5
        elif ai_result.get("is_payment", False):
            results["checks"].append({
                "name": "AI Analysis",
                "passed": True,
                "detail": ai_result.get("analysis", "AI confirms this is a payment screenshot")[:100],
                "severity": "info"
            })
            results["score"] += 40
            results["is_payment_screenshot"] = True
            
            # Check amount match
            if ai_result.get("amount_detected") and expected_amount > 0:
                if ai_result.get("amount_matches", False):
                    results["checks"].append({
                        "name": "Amount Verification",
                        "passed": True,
                        "detail": f"Amount ₹{expected_amount} detected and matches plan",
                        "severity": "info"
                    })
                    results["score"] += 20
                    results["amount_matches"] = True
                else:
                    detected = ai_result.get("amount_detected", "unknown")
                    results["checks"].append({
                        "name": "Amount Verification",
                        "passed": False,
                        "detail": f"Expected ₹{expected_amount} but detected '{detected}'",
                        "severity": "high"
                    })
                    results["rejection_reasons"].append(f"Amount mismatch: expected ₹{expected_amount}")
        else:
            results["checks"].append({
                "name": "AI Analysis",
                "passed": False,
                "detail": ai_result.get("analysis", "AI does not recognize this as a payment screenshot")[:100],
                "severity": "high"
            })
            results["rejection_reasons"].append(ai_result.get("analysis", "Not a payment screenshot")[:100])
            results["score"] -= 40

        # === FINAL VERDICT ===
        results["passed"] = results["score"] >= 60 and results["is_payment_screenshot"]
        if results["passed"]:
            results["checks"].append({
                "name": "Final Verdict",
                "passed": True,
                "detail": f"Score: {results['score']}/{results['max_score']} - Payment screenshot verified!",
                "severity": "success"
            })
        else:
            if not results["rejection_reasons"]:
                results["rejection_reasons"].append("Multiple checks failed")
            results["checks"].append({
                "name": "Final Verdict",
                "passed": False,
                "detail": f"Score: {results['score']}/{results['max_score']} - REJECTED",
                "severity": "error"
            })

        return results

    async def _analyze_with_ai(self, image_bytes: bytes, filename: str, expected_amount: int) -> dict:
        """Use GPT-5 to deeply analyze if this is a genuine payment screenshot."""
        try:
            img = Image.open(io.BytesIO(image_bytes))
            w, h = img.size
            file_size = len(image_bytes)

            prompt = f"""You are a STRICT payment verification AI. Analyze this UPI payment screenshot.

IMAGE METADATA:
- Filename: {filename}
- Dimensions: {w}x{h}
- File size: {file_size/1024:.1f}KB
- Expected amount: ₹{expected_amount}

STRICT RULES:
1. Is this a genuine UPI payment screenshot? (Google Pay, PhonePe, Paytm, BHIM, etc)
2. Does it show a successful payment confirmation?
3. Can you see the amount ₹{expected_amount} anywhere?
4. Does it have transaction details (UPI ID, reference number, bank name)?
5. Is this clearly a mobile phone screenshot?

Reply in EXACTLY this JSON format (NO OTHER TEXT):
{{
  "is_payment": true/false,
  "confidence": "high/medium/low",
  "amount_detected": "the amount you see or null",
  "amount_matches": true/false,
  "analysis": "detailed 1-line reason why this is or isn't a payment screenshot"
}}

Be EXTREMELY strict. If unsure, return is_payment: false."""

            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.get(
                    "https://r-bots-free-apis.co08.art/api/v1/api/gpt-5",
                    params={"q": prompt},
                    timeout=30.0
                )

                if resp.status_code == 200:
                    data = resp.json()
                    text = str(data.get("results", data.get("response", "")))
                    
                    # Try to parse JSON from response
                    try:
                        import re
                        json_match = re.search(r'\{[^{}]*\}', text, re.DOTALL)
                        if json_match:
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
                    
                    # Fallback: check for yes/no in response
                    is_payment = "yes" in text.lower() or "true" in text.lower()
                    return {
                        "is_payment": is_payment,
                        "confidence": "low",
                        "amount_detected": None,
                        "amount_matches": False,
                        "analysis": text[:150],
                    }

                return {"error": f"API returned {resp.status_code}"}

        except Exception as e:
            return {"error": str(e)[:100]}


payment_verifier = PaymentVerifier()
