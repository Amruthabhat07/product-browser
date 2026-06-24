import streamlit as st
import requests
import pandas as pd

BACKEND_URL = "https://product-browser-l4gj.onrender.com"

st.set_page_config(page_title="Product Browser")

st.title("🛍️ Product Browser")

# Categories
try:
    response = requests.get(
        f"{BACKEND_URL}/products/categories"
    )

    categories = [
        item["category"]
        for item in response.json()
    ]

except:
    categories = []

selected_category = st.selectbox(
    "Category",
    ["All"] + categories
)

# Session state
if "cursor" not in st.session_state:
    st.session_state.cursor = None

if "snapshotTime" not in st.session_state:
    st.session_state.snapshotTime = None

params = {}

if selected_category != "All":
    params["category"] = selected_category

if st.session_state.cursor:
    params["cursorUpdatedAt"] = st.session_state.cursor["updatedAt"]
    params["cursorId"] = st.session_state.cursor["id"]

if st.session_state.snapshotTime:
    params["snapshotTime"] = st.session_state.snapshotTime

response = requests.get(
    f"{BACKEND_URL}/products",
    params=params
)

data = response.json()

if (
    st.session_state.snapshotTime is None
    and "snapshotTime" in data
):
    st.session_state.snapshotTime = data["snapshotTime"]

products = data.get("items", [])

if products:
    df = pd.DataFrame(products)

    st.dataframe(
        df[
            [
                "name",
                "category",
                "price",
                "updatedAt"
            ]
        ],
        use_container_width=True
    )

col1, col2 = st.columns(2)

with col1:
    if st.button("Next Page"):
        st.session_state.cursor = data.get("nextCursor")
        st.rerun()

with col2:
    if st.button("Start Over"):
        st.session_state.cursor = None
        st.session_state.snapshotTime = None
        st.rerun()