import streamlit as st
import requests
import json
import time
from PIL import Image
import io
import pandas as pd
from components import display_header, display_prediction, display_heatmap, draw_bounding_box

# Configure Page
st.set_page_config(
    page_title="Deepfake Detective",
    page_icon="🕵️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# API Endpoint (FastAPI backend)
API_URL = "http://localhost:8000"

def main():
    display_header()
    
    st.sidebar.title("Navigation")
    app_mode = st.sidebar.selectbox("Choose the mode",
                                   ["Image Detection", "Video Detection", "Real-Time Webcam", "Analytics Dashboard"])

    if app_mode == "Image Detection":
        st.subheader("Image Deepfake Detection")
        uploaded_file = st.file_uploader("Upload an Image", type=["jpg", "jpeg", "png"])
        
        if uploaded_file is not None:
            image = Image.open(uploaded_file)
            st.image(image, caption="Uploaded Image", use_column_width=True)
            
            if st.button("Analyze Image"):
                with st.spinner("Analyzing image..."):
                    try:
                        # Send to API
                        files = {"file": (uploaded_file.name, uploaded_file.getvalue(), "image/jpeg")}
                        response = requests.post(f"{API_URL}/predict/image", files=files)
                        
                        if response.status_code == 200:
                            result = response.json()
                            if result["status"] == "success":
                                col1, col2 = st.columns(2)
                                
                                with col1:
                                    st.markdown("### Results")
                                    display_prediction(result["prediction"], result["confidence"])
                                    
                                    # Draw bounding box
                                    if result["box"]:
                                        img_with_box = draw_bounding_box(image, result["box"])
                                        st.image(img_with_box, caption="Detected Face", use_column_width=True)
                                        
                                with col2:
                                    display_heatmap(result.get("heatmap_base64"))
                            else:
                                st.error(f"Error: {result.get('error', 'Unknown error')}")
                        else:
                            st.error(f"API Error: {response.status_code}")
                    except requests.exceptions.ConnectionError:
                        st.error("Could not connect to backend. Is the FastAPI server running?")

    elif app_mode == "Video Detection":
        st.subheader("Video Deepfake Detection")
        uploaded_file = st.file_uploader("Upload a Video", type=["mp4", "avi", "mov"])
        
        if uploaded_file is not None:
            st.video(uploaded_file)
            
            if st.button("Analyze Video"):
                with st.spinner("Extracting frames and analyzing... This may take a while."):
                    try:
                        files = {"file": (uploaded_file.name, uploaded_file.getvalue(), "video/mp4")}
                        response = requests.post(f"{API_URL}/predict/video", files=files)
                        
                        if response.status_code == 200:
                            result = response.json()
                            if result["status"] == "success":
                                st.markdown("### Overall Result")
                                display_prediction(result["overall_prediction"], result["overall_confidence"])
                                
                                st.markdown("### Frame-by-Frame Analysis")
                                df = pd.DataFrame(result["frame_results"])
                                st.dataframe(df)
                                
                                st.line_chart(df["confidence"])
                            else:
                                st.error(f"Error: {result.get('error', 'Unknown error')}")
                        else:
                            st.error(f"API Error: {response.status_code}")
                    except requests.exceptions.ConnectionError:
                        st.error("Could not connect to backend. Is the FastAPI server running?")
                        
    elif app_mode == "Real-Time Webcam":
        st.subheader("Webcam Detection (Demo)")
        st.info("Feature under development. For production, WebRTC or OpenCV video streaming is recommended.")
        run = st.checkbox("Turn on Webcam")
        
        if run:
            st.warning("Ensure backend is running and optimized for low-latency.")
            # Placeholder for webcam logic (Streamlit camera_input can be used for snapshots)
            cam_img = st.camera_input("Take a snapshot for analysis")
            if cam_img:
                with st.spinner("Analyzing snapshot..."):
                    try:
                        files = {"file": ("snapshot.jpg", cam_img.getvalue(), "image/jpeg")}
                        response = requests.post(f"{API_URL}/predict/image", files=files)
                        if response.status_code == 200:
                            res = response.json()
                            if res["status"] == "success":
                                display_prediction(res["prediction"], res["confidence"])
                    except Exception as e:
                        st.error(str(e))

    elif app_mode == "Analytics Dashboard":
        st.subheader("System Analytics")
        st.markdown("Metrics for system performance, recent detections, and model accuracy.")
        
        col1, col2, col3 = st.columns(3)
        col1.metric(label="Total Scans", value="1,245", delta="12%")
        col2.metric(label="Avg Inference Time", value="0.45s", delta="-5%")
        col3.metric(label="Deepfakes Detected", value="342", delta="2%")
        
        st.bar_chart(pd.DataFrame({"Scans": [50, 60, 80, 45, 90, 120]}, index=["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]))

if __name__ == "__main__":
    main()
