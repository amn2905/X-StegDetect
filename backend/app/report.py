import os
from datetime import datetime
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from app.config import REPORTS_DIR

def generate_forensic_pdf(metadata: dict, image_paths: dict) -> Path:
    """
    Generates a professional digital forensic PDF report.
    metadata: dict containing 'uuid', 'filename', 'timestamp', 'model', 'prediction', 'confidence', 'processing_time', 'summary'.
    image_paths: dict mapping image types ('original', 'noise', 'edge', 'artifact', 'gradcam', 'shap', 'lime') to absolute file paths.
    
    Returns: Path to the generated PDF.
    """
    report_id = metadata.get("uuid", "unknown")
    pdf_path = REPORTS_DIR / f"forensic_report_{report_id}.pdf"
    
    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    
    styles = getSampleStyleSheet()
    
    # Custom forensic styling palette (Deep Navy, Slate Gray, Cybersecurity Cyan/Teal)
    primary_color = colors.HexColor("#0f172a")  # Slate 900
    accent_color = colors.HexColor("#0284c7")   # Sky 600
    stego_color = colors.HexColor("#b91c1c")    # Red 700 (Alert)
    cover_color = colors.HexColor("#15803d")    # Green 700 (Safe)
    text_color = colors.HexColor("#334155")     # Slate 700
    
    # Define Paragraph Styles
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=primary_color,
        alignment=0, # Left aligned
        spaceAfter=15
    )
    
    h1_style = ParagraphStyle(
        "Heading1_Custom",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        textColor=primary_color,
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        "BodyText_Custom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=13,
        textColor=text_color,
        spaceAfter=10
    )
    
    meta_label_style = ParagraphStyle(
        "MetaLabel",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=11,
        textColor=colors.HexColor("#1e293b")
    )
    
    meta_val_style = ParagraphStyle(
        "MetaValue",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=11,
        textColor=text_color
    )
    
    pred_val_style = ParagraphStyle(
        "PredValue",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=13,
        textColor=stego_color if metadata.get("prediction") == "STEGO" else cover_color
    )

    story = []
    
    # Header Banner / Logo Placeholder
    story.append(Paragraph("X-StegDetect Forensic Analysis Report", title_style))
    story.append(Paragraph(f"Generated on {metadata.get('timestamp', datetime.now().strftime('%Y-%m-%d %H:%M:%S'))}", body_style))
    story.append(Spacer(1, 10))
    
    # Metadata Table
    metadata_data = [
        [
            Paragraph("Investigation UUID:", meta_label_style),
            Paragraph(metadata.get("uuid"), meta_val_style),
            Paragraph("Target Model:", meta_label_style),
            Paragraph(metadata.get("model"), meta_val_style),
        ],
        [
            Paragraph("Filename:", meta_label_style),
            Paragraph(metadata.get("filename"), meta_val_style),
            Paragraph("Prediction Verdict:", meta_label_style),
            Paragraph(metadata.get("prediction"), pred_val_style),
        ],
        [
            Paragraph("Capture Device / Format:", meta_label_style),
            Paragraph(Path(metadata.get("filename", "")).suffix.upper().replace(".", ""), meta_val_style),
            Paragraph("Confidence Score:", meta_label_style),
            Paragraph(f"{metadata.get('confidence', 0.0):.2f}%", pred_val_style),
        ],
        [
            Paragraph("Processing Time:", meta_label_style),
            Paragraph(metadata.get("processing_time", "N/A"), meta_val_style),
            Paragraph("Status Flag:", meta_label_style),
            Paragraph("SUSPICIOUS (ALTERED)" if metadata.get("prediction") == "STEGO" else "VERIFIED CLEAN", pred_val_style)
        ]
    ]
    
    meta_table = Table(metadata_data, colWidths=[120, 150, 110, 140])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    
    story.append(meta_table)
    story.append(Spacer(1, 15))
    
    # Section 1: Forensic Residuals
    story.append(Paragraph("1. Image Noise & Residual Artifact Maps", h1_style))
    story.append(Paragraph("The filters below isolate high-frequency noise configurations and spatial edges to uncover hidden alterations mapped by the encoder networks.", body_style))
    
    # Check that paths exist and are valid ReportLab Images
    img_size = 115
    residuals_data = []
    
    # Prepare row for images
    img_row = []
    label_row = []
    
    img_keys = [("original", "Original Image"), ("noise", "Noise Residual"), ("edge", "Edge Residual"), ("artifact", "Artifact Map")]
    for key, label in img_keys:
        p = image_paths.get(key)
        if p and os.path.exists(p):
            img_row.append(RLImage(p, width=img_size, height=img_size))
        else:
            img_row.append(Paragraph("Image Not Available", body_style))
        label_row.append(Paragraph(label, meta_label_style))
        
    residuals_table_data = [label_row, img_row]
    residuals_table = Table(residuals_table_data, colWidths=[130, 130, 130, 130])
    residuals_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(residuals_table)
    story.append(Spacer(1, 15))
    
    # Section 2: Explainable AI Visualizations
    xai_story = []
    xai_story.append(Paragraph("2. Explainable AI Predictive Interpretations", h1_style))
    xai_story.append(Paragraph("Attention maps and feature contributions detailing what pixels and superpixels influenced the model predictions.", body_style))
    
    xai_img_size = 150
    xai_img_row = []
    xai_label_row = []
    
    xai_keys = [("gradcam", "Grad-CAM (Attention Overlay)"), ("shap", "SHAP (Coalition Analysis)"), ("lime", "LIME (Evidence Mapping)")]
    for key, label in xai_keys:
        p = image_paths.get(key)
        if p and os.path.exists(p):
            xai_img_row.append(RLImage(p, width=xai_img_size, height=xai_img_size))
        else:
            xai_img_row.append(Paragraph("Image Not Available", body_style))
        xai_label_row.append(Paragraph(label, meta_label_style))
        
    xai_table_data = [xai_label_row, xai_img_row]
    xai_table = Table(xai_table_data, colWidths=[174, 174, 174])
    xai_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    
    xai_story.append(xai_table)
    xai_story.append(Spacer(1, 15))
    
    # Section 3: Summary & Investigator Verdict
    xai_story.append(Paragraph("3. Forensic Investigation Verdict Summary", h1_style))
    verdict_text = metadata.get("summary", "No summary provided by the detection models.")
    xai_story.append(Paragraph(verdict_text, body_style))
    
    # Wrap XAI sections together so it doesn't split awkwardly
    story.append(KeepTogether(xai_story))
    
    # Build Document
    doc.build(story)
    return pdf_path
