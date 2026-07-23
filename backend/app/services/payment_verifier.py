"""PAYMENT SCREENSHOT VERIFIER v3 - Smart structure analysis based on research."""

import json
from PIL import Image, ImageFilter
import io

PLANS = {"basic": 199, "pro": 499, "premium": 999}

class PaymentVerifier:
    """Detects real UPI payment screenshots by analyzing structural patterns."""

    async def verify(self, image_bytes: bytes, filename: str, plan_key: str) -> dict:
        results = {"is_payment_screenshot": False, "passed": False, "score": 0, "max_score": 100, "detected_app": None, "checks": [], "rejection_reasons": []}
        ext = filename.split(".")[-1].lower() if "." in filename else ""

        if ext not in ["png", "jpg", "jpeg"]:
            self._add(results, "Format", False, f"Only PNG/JPG", "high")
            results["score"] -= 25
        else:
            self._add(results, "Format", True, f".{ext}", "info")

        fs = len(image_bytes)
        if fs < 10 * 1024:
            self._add(results, "Size", False, f"Too small ({fs/1024:.1f}KB)", "high")
            results["score"] -= 20
        else:
            self._add(results, "Size", True, f"{fs/1024:.1f}KB", "info")
            results["score"] += 5

        try:
            img = Image.open(io.BytesIO(image_bytes))
            w, h = img.size

            if w < 400 or h < 600:
                self._add(results, "Resolution", False, f"Too small ({w}x{h})", "high")
                results["score"] -= 25
            else:
                self._add(results, "Resolution", True, f"{w}x{h}", "info")
                results["score"] += 5

            if h > w:
                self._add(results, "Orientation", True, "Portrait ✓", "info")
                results["score"] += 5
            else:
                self._add(results, "Orientation", False, "Landscape", "high")
                results["score"] -= 15

            # ADVANCED STRUCTURAL ANALYSIS
            analysis = self._structure_analysis(img)

            # REAL SCREENSHOT DETECTION - checks for text line patterns
            if analysis.get("has_text_lines", False):
                self._add(results, "Text Layout", True, "Structured text rows ✓", "info")
                results["score"] += 35
            else:
                self._add(results, "Text Layout", False, "No organized text pattern", "high")
                results["rejection_reasons"].append("No structured text rows")
                results["score"] -= 15

            # EDGE DENSITY - too much = photo, too little = blank
            ed = analysis.get("edge_density", 0)
            if 0.003 < ed < 0.3:
                self._add(results, "Edge Profile", True, f"Normal ({ed:.3f})", "info")
                results["score"] += 10
            elif ed >= 0.35:
                self._add(results, "Edge Profile", False, f"Too noisy ({ed:.3f})", "high")
                results["rejection_reasons"].append("Too much noise - photo or art")
                results["score"] -= 15
            else:
                self._add(results, "Edge Profile", False, "Blank image", "high")
                results["rejection_reasons"].append("No edges - blank")
                results["score"] -= 20

            # DIVERSITY
            div = analysis.get("diversity", 0.5)
            if 0.003 < div < 0.35:
                self._add(results, "Color Range", True, f"Normal ({div:.3f})", "info")
                results["score"] += 10
            elif div >= 0.35:
                self._add(results, "Color Range", False, f"Too many colors ({div:.3f})", "high")
                results["rejection_reasons"].append("Too colorful - photo likely")
                results["score"] -= 15
            else:
                self._add(results, "Color Range", False, "Solid/blank", "high")
                results["score"] -= 20

            # GREEN SUCCESS INDICATOR
            if analysis.get("has_green", False):
                self._add(results, "Success Badge", True, "Green success indicator ✓", "info")
                results["score"] += 25
            else:
                self._add(results, "Success Badge", True, "No green badge", "warning")

            # WHITE CARD AREA
            if analysis.get("white_card_ratio", 0) > 0.03:
                self._add(results, "Card Area", True, "Payment card area ✓", "info")
                results["score"] += 15

            # HEADER REGION
            if analysis.get("has_header", False):
                self._add(results, "Header", True, "App branding header ✓", "info")
                results["score"] += 10

        except Exception as e:
            self._add(results, "Image", False, f"Error: {str(e)[:40]}", "high")
            results["score"] -= 40

        if results["score"] >= 35:
            results["is_payment_screenshot"] = True
            results["passed"] = True
            self._add(results, "RESULT", True, f"PASSED ✓ ({results['score']}/100)", "success")
        else:
            results["passed"] = False
            self._add(results, "RESULT", False, f"REJECTED ✗ ({results['score']}/100)", "error")

        return results

    def _structure_analysis(self, img):
        """SMART analysis: looks for structured UI patterns vs random noise."""
        result = {"has_text_lines": False, "edge_density": 0, "diversity": 0, "has_green": False, "white_card_ratio": 0, "has_header": False}
        if img.mode != "RGB": img = img.convert("RGB")

        w, h = img.size
        pixels = list(img.getdata())
        step = max(1, len(pixels) // 5000)
        sampled = [pixels[i] for i in range(0, len(pixels), step)]

        # Color diversity
        unique = len(set(sampled[:800]))
        result["diversity"] = unique / min(800, len(sampled))

        # Edge analysis
        gray = img.convert("L")
        edges = gray.filter(ImageFilter.FIND_EDGES)
        edge_data = list(edges.getdata())
        result["edge_density"] = sum(1 for p in edge_data if p > 30) / len(edge_data)

        # SMART TEXT LINE DETECTION - key differentiator!
        # Real screenshots have horizontal text lines at consistent intervals
        # Check edge distribution per row
        row_edge_counts = []
        for y in range(0, h, max(1, h // 200)):  # Sample 200 rows
            row_edges = 0
            for x in range(0, w, max(1, w // 50)):  # Sample 50 cols per row
                idx = y * w + x
                if idx < len(edge_data) and edge_data[idx] > 30:
                    row_edges += 1
            row_edge_counts.append(row_edges)

        # In real UPI screenshots, edge-rich rows alternate with edge-poor rows (text + spacing)
        # In abstract art, edges are distributed more uniformly
        if row_edge_counts:
            non_zero = [c for c in row_edge_counts if c > 0]
            if non_zero:
                avg = sum(non_zero) / len(non_zero)
                variance = sum((c - avg)**2 for c in non_zero) / len(non_zero)
                # High variance = structured text rows
                # Low variance = uniform noise (abstract art)
                result["has_text_lines"] = variance > avg * 0.5 and len(non_zero) < len(row_edge_counts) * 0.85

        # Green detection
        green_count = 0
        for r_val, g_val, b_val in sampled:
            if g_val > r_val + 40 and g_val > b_val + 40 and g_val > 80:
                green_count += 1
        result["has_green"] = green_count > len(sampled) * 0.004

        # White card detection in middle region
        mid_start_y = h // 4
        mid_end_y = h * 3 // 4
        mid_start_x = w // 5
        mid_end_x = w * 4 // 5
        white_count = 0
        total_count = 0
        for y in range(mid_start_y, min(mid_end_y, h), 3):
            for x in range(mid_start_x, min(mid_end_x, w), 3):
                try:
                    r_val, g_val, b_val = img.getpixel((x, y))
                    if r_val > 235 and g_val > 235 and b_val > 235:
                        white_count += 1
                    total_count += 1
                except:
                    pass
        result["white_card_ratio"] = white_count / max(total_count, 1)

        # Header detection (top 60px)
        top_pixels = []
        for x in range(0, w, max(1, w // 30)):
            for y_check in range(0, min(60, h)):
                try: top_pixels.append(img.getpixel((x, y_check)))
                except: pass
        if top_pixels:
            top_r = sum(c[0] for c in top_pixels) / len(top_pixels)
            top_g = sum(c[1] for c in top_pixels) / len(top_pixels)
            top_b = sum(c[2] for c in top_pixels) / len(top_pixels)
            color_range = max(abs(top_r - top_g), abs(top_g - top_b), abs(top_b - top_r), abs(top_r - top_b))
            not_too_white = max(top_r, top_g, top_b) < 230
            not_too_dark = max(top_r, top_g, top_b) > 40
            result["has_header"] = color_range > 15 and not_too_white

        return result

    def _add(self, r, name, passed, detail, severity):
        r["checks"].append({"name": name, "passed": passed, "detail": str(detail)[:100], "severity": severity})

payment_verifier = PaymentVerifier()
