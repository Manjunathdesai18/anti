import streamlit as st
import base64
from io import BytesIO
from PIL import Image

def display_header():
    st.markdown("""
        <style>
        .main-header {
            font-size: 3rem;
            color: #1E3A8A;
            text-align: center;
            font-weight: 700;
            margin-bottom: 0;
        }
        .sub-header {
            font-size: 1.2rem;
            color: #4B5563;
            text-align: center;
            margin-bottom: 2rem;
        }
        </style>
        <h1 class='main-header'>Deepfake Detective</h1>
        <p class='sub-header'>Advanced AI-powered image and video manipulation detection</p>
    """, unsafe_allow_html=True)

def display_prediction(prediction, confidence):
    color = "#10B981" if prediction == "REAL" else "#EF4444"
    icon = "✅" if prediction == "REAL" else "⚠️"
    
    st.markdown(f"""
        <div style="background-color: {color}20; border: 2px solid {color}; border-radius: 10px; padding: 20px; text-align: center;">
            <h2 style="color: {color}; margin: 0;">{icon} {prediction}</h2>
            <p style="font-size: 1.2rem; margin-top: 10px;">Confidence: <b>{confidence*100:.2f}%</b></p>
        </div>
    """, unsafe_allow_html=True)

def display_heatmap(base64_img):
    if base64_img:
        st.markdown("### Explainability (Grad-CAM)")
        st.markdown("Heatmap highlights regions the AI focused on to make its decision.")
        img_data = base64.b64decode(base64_img)
        img = Image.open(BytesIO(img_data))
        st.image(img, caption="Grad-CAM Heatmap", use_column_width=True)

def draw_bounding_box(image, box):
    from PIL import ImageDraw
    img_copy = image.copy()
    draw = ImageDraw.Draw(img_copy)
    # Box is [x1, y1, x2, y2]
    draw.rectangle(box, outline="red", width=3)
    return img_copy
