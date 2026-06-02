"""
pdf_report.py — Generates a PDF summary report for a deepfake detection result.
Uses ReportLab for layout.
"""

import io
import base64
from datetime import datetime
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table,
    TableStyle, HRFlowable, Image as RLImage
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT


def generate_pdf_report(upload_data: dict, result_data: dict, username: str) -> bytes:
    """
    Generate a PDF report for a deepfake detection result.

    Args:
        upload_data: dict with filename, file_type, created_at
        result_data: dict with prediction, confidence, frame_results, explanation
        username: display name of the user

    Returns:
        PDF bytes
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    styles = getSampleStyleSheet()
    story = []

    # ── Header ─────────────────────────────────────────────
    title_style = ParagraphStyle(
        "Title", parent=styles["Title"],
        fontSize=22, spaceAfter=6, textColor=colors.HexColor("#6C63FF"),
        alignment=TA_CENTER
    )
    subtitle_style = ParagraphStyle(
        "Subtitle", parent=styles["Normal"],
        fontSize=10, textColor=colors.grey, alignment=TA_CENTER
    )
    story.append(Paragraph("🕵️ Deepfake Detective", title_style))
    story.append(Paragraph("AI-Generated Media Detection Report", subtitle_style))
    story.append(Spacer(1, 0.3 * cm))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#6C63FF")))
    story.append(Spacer(1, 0.5 * cm))

    # ── Meta Info ──────────────────────────────────────────
    section_style = ParagraphStyle(
        "Section", parent=styles["Heading2"],
        fontSize=13, textColor=colors.HexColor("#1a1a2e"), spaceBefore=12
    )
    body_style = ParagraphStyle(
        "Body", parent=styles["Normal"], fontSize=10, leading=16
    )

    story.append(Paragraph("Report Information", section_style))
    meta_data = [
        ["Field", "Value"],
        ["Report Generated", datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")],
        ["Requested By", username],
        ["File Name", upload_data.get("filename", "N/A")],
        ["File Type", upload_data.get("file_type", "N/A").capitalize()],
        ["Upload Date", str(upload_data.get("created_at", "N/A"))[:19]],
    ]
    meta_table = Table(meta_data, colWidths=[5 * cm, 12 * cm])
    meta_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#6C63FF")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f8f8ff"), colors.white]),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
        ("PADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 0.5 * cm))

    # ── Main Result ────────────────────────────────────────
    prediction = result_data.get("prediction", "UNKNOWN")
    confidence = result_data.get("confidence", 0.0)
    result_color = colors.HexColor("#e74c3c") if prediction == "FAKE" else colors.HexColor("#2ecc71")

    story.append(Paragraph("Detection Result", section_style))
    result_style = ParagraphStyle(
        "Result", parent=styles["Normal"],
        fontSize=24, textColor=result_color,
        spaceAfter=6, alignment=TA_CENTER, fontName="Helvetica-Bold"
    )
    verdict_icon = "⚠️ AI GENERATED (FAKE)" if prediction == "FAKE" else "✅ AUTHENTIC (REAL)"
    story.append(Paragraph(verdict_icon, result_style))

    conf_pct = f"{confidence * 100:.1f}%"
    story.append(Paragraph(f"<b>Confidence Score:</b> {conf_pct}", body_style))
    story.append(Spacer(1, 0.3 * cm))

    # Confidence bar (visual)
    bar_data = [["Confidence Level", conf_pct]]
    bar_table = Table(bar_data, colWidths=[5 * cm, 12 * cm])
    bar_table.setStyle(TableStyle([
        ("BACKGROUND", (1, 0), (1, 0), result_color),
        ("TEXTCOLOR", (0, 0), (-1, -1), colors.white),
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 11),
        ("PADDING", (0, 0), (-1, -1), 10),
        ("GRID", (0, 0), (-1, -1), 1, colors.white),
    ]))
    story.append(bar_table)
    story.append(Spacer(1, 0.5 * cm))

    # ── Explanation ────────────────────────────────────────
    explanation = result_data.get("explanation", "")
    if explanation:
        story.append(Paragraph("Analysis Explanation", section_style))
        story.append(Paragraph(explanation, body_style))
        story.append(Spacer(1, 0.5 * cm))

    # ── Frame Analysis (video) ─────────────────────────────
    frame_results = result_data.get("frame_results") or []
    if frame_results:
        story.append(Paragraph("Frame-by-Frame Analysis", section_style))
        frame_data = [["Frame #", "Prediction", "Confidence"]]
        for fr in frame_results:
            frame_data.append([
                str(fr.get("frame_idx", "")),
                fr.get("prediction", ""),
                f"{fr.get('confidence', 0) * 100:.1f}%"
            ])
        frame_table = Table(frame_data, colWidths=[4 * cm, 6 * cm, 7 * cm])
        frame_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#6C63FF")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#f8f8ff"), colors.white]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
            ("PADDING", (0, 0), (-1, -1), 6),
            ("ALIGN", (2, 0), (2, -1), "CENTER"),
        ]))
        story.append(frame_table)
        story.append(Spacer(1, 0.5 * cm))

    # ── Heatmap ────────────────────────────────────────────
    heatmap_b64 = result_data.get("heatmap_base64")
    if heatmap_b64:
        story.append(Paragraph("Grad-CAM Heatmap", section_style))
        try:
            img_bytes = base64.b64decode(heatmap_b64)
            img_buf = io.BytesIO(img_bytes)
            rl_img = RLImage(img_buf, width=10 * cm, height=8 * cm)
            story.append(rl_img)
            story.append(Paragraph(
                "The heatmap highlights the facial regions that most influenced the prediction.",
                body_style
            ))
        except Exception:
            pass
        story.append(Spacer(1, 0.5 * cm))

    # ── Footer ─────────────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#cccccc")))
    footer_style = ParagraphStyle(
        "Footer", parent=styles["Normal"],
        fontSize=8, textColor=colors.grey, alignment=TA_CENTER, spaceBefore=6
    )
    story.append(Paragraph(
        "Generated by Deepfake Detective — AI-Powered Media Authenticity System | For research use only.",
        footer_style
    ))

    doc.build(story)
    return buffer.getvalue()
