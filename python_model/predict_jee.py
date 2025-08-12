import os
import pandas as pd
from pymongo import MongoClient
import sys
import re

# ==== MongoDB Config ====
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "college"
COLLECTION_NAME = "jee_cut_off"


df = pd.read_csv("Jee_2023_2024.csv")
print(f"Rows loaded: {len(df)}")

# ==== 2. Ensure required columns ====
required_cols = {"College", "Course", "Category", "Allotted_Rank_2023", "Allotted_Rank_2024"}
if not required_cols.issubset(df.columns):
    print("ERROR: CSV does not contain required columns!")
    sys.exit(1)

# ==== 3. Clean ranks (remove non-numeric chars, convert to float) ====
def clean_rank(value):
    if pd.isna(value):
        return None
    match = re.search(r"\d+", str(value))  # keep only numbers
    return float(match.group()) if match else None

df["Allotted_Rank_2023"] = df["Allotted_Rank_2023"].apply(clean_rank)
df["Allotted_Rank_2024"] = df["Allotted_Rank_2024"].apply(clean_rank)

# Drop rows where both ranks are missing
df = df.dropna(subset=["Allotted_Rank_2023", "Allotted_Rank_2024"])
print(f"Rows after cleaning: {len(df)}")

# ==== 4. Prediction Logic (OPEN & PWD handled separately) ====
predictions = []

for (college, course), group in df.groupby(["College", "Course"]):
    # Split PWD and Non-PWD categories
    normal_cats = group[~group["Category"].str.contains("PWD", case=False, na=False)]
    pwd_cats = group[group["Category"].str.contains("PWD", case=False, na=False)]

    # ---- Normal Categories (OPEN base) ----
    open_row = normal_cats[normal_cats["Category"].str.upper() == "OPEN"]
    if len(open_row) > 0:
        rank_2023_open = open_row["Allotted_Rank_2023"].values[0]
        rank_2024_open = open_row["Allotted_Rank_2024"].values[0]
        pct_change_open = (rank_2024_open - rank_2023_open) / rank_2023_open if rank_2023_open != 0 else 0
        pred_open_2025 = rank_2024_open * (1 + pct_change_open)

        for _, row in normal_cats.iterrows():
            category = row["Category"]
            rank_2024 = row["Allotted_Rank_2024"]
            if category.upper() == "OPEN":
                pred_rank = pred_open_2025
            else:
                delta = (rank_2024 - rank_2024_open) / rank_2024_open if rank_2024_open != 0 else 0
                pred_rank = pred_open_2025 * (1 + delta)
            predictions.append({
                "College": college,
                "Course": course,
                "Category": category,
                "Predicted_Rank_2025": int(round(pred_rank))
            })

    # ---- PWD Categories (OPEN (PWD) base) ----
    open_pwd_row = pwd_cats[pwd_cats["Category"].str.upper() == "OPEN (PWD)"]
    if len(open_pwd_row) > 0:
        rank_2023_open_pwd = open_pwd_row["Allotted_Rank_2023"].values[0]
        rank_2024_open_pwd = open_pwd_row["Allotted_Rank_2024"].values[0]
        pct_change_open_pwd = (rank_2024_open_pwd - rank_2023_open_pwd) / rank_2023_open_pwd if rank_2023_open_pwd != 0 else 0
        pred_open_pwd_2025 = rank_2024_open_pwd * (1 + pct_change_open_pwd)

        for _, row in pwd_cats.iterrows():
            category = row["Category"]
            rank_2024 = row["Allotted_Rank_2024"]
            if category.upper() == "OPEN (PWD)":
                pred_rank = pred_open_pwd_2025
            else:
                delta = (rank_2024 - rank_2024_open_pwd) / rank_2024_open_pwd if rank_2024_open_pwd != 0 else 0
                pred_rank = pred_open_pwd_2025 * (1 + delta)
            predictions.append({
                "College": college,
                "Course": course,
                "Category": category,
                "Predicted_Rank_2025": int(round(pred_rank))
            })

print(f"Predictions generated: {len(predictions)}")

# ==== 5. Store in MongoDB ====
try:
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    collection.delete_many({})
    collection.insert_many(predictions)
    print(f"Inserted {len(predictions)} JEE predictions into MongoDB successfully!")
except Exception as e:
    print(f"MongoDB Error: {e}")
