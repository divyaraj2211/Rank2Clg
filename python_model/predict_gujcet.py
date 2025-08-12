import pandas as pd
from pymongo import MongoClient
import re

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")
db = client["college_predictor"]
collection = db["gujcet_cut_off"]

# Load CSV 
df = pd.read_csv("Gujcet_2023_2024_Cleaned_WithNaN.csv")


df = df.rename(columns={
    "Branch": "Course",
    "Closing Rank 2023": "Allotted_Rank_2023",
    "Closing Rank 2024": "Allotted_Rank_2024"
})

# into float/int
def clean_rank(val):
    if pd.isna(val):
        return None
    m = re.search(r"\d+", str(val))
    return float(m.group()) if m else None

df["Allotted_Rank_2023"] = df["Allotted_Rank_2023"].apply(clean_rank)
df["Allotted_Rank_2024"] = df["Allotted_Rank_2024"].apply(clean_rank)
df = df.dropna(subset=["Allotted_Rank_2023", "Allotted_Rank_2024"])

predictions = []

# Prediction for each (College, Course, Category)
for (college, course), group in df.groupby(["College", "Course"]):
    for is_pwd in [False, True]:
        # Separate normal vs PWD categories
        subset = group[group["Category"].str.contains("PWD", case=False) == is_pwd]
        if subset.empty:
            continue

        # Base OPEN category
        base_cat = "OPEN (PWD)" if is_pwd else "OPEN"
        base = subset[subset["Category"].str.upper() == base_cat.upper()]
        if base.empty:
            continue

        rank23, rank24 = base.iloc[0][["Allotted_Rank_2023", "Allotted_Rank_2024"]]
        change_pct = (rank24 - rank23) / rank23 if rank23 else 0
        pred_base_2025 = rank24 * (1 + change_pct)

        for _, row in subset.iterrows():
            delta = ((row["Allotted_Rank_2024"] - rank24) / rank24) if rank24 else 0
            pred_rank = pred_base_2025 if row["Category"].upper() == base_cat.upper() else pred_base_2025 * (1 + delta)
            predictions.append({
                "College": college,
                "Course": course,
                "Category": row["Category"],
                "Predicted_Rank_2025": int(round(pred_rank))
            })

# Save to MongoDB
collection.delete_many({})
collection.insert_many(predictions)

print(f"Inserted {len(predictions)} GUJCET predictions into MongoDB.")
