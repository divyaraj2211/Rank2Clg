import os
import pandas as pd
from sklearn.linear_model import LinearRegression
from pymongo import MongoClient
import numpy as np

#  MongoDB 
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "college"
COLLECTION_NAME = "neet_off"

# CSV Path 
# BASE_DIR = os.path.dirname(__file__)
# CSV_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "data", "final.csv"))

#  Load CSV
df = pd.read_csv("final.csv")

# 2. Reshape (wide → long)
df_long = df.melt(
    id_vars=["College", "Course", "Category"],
    value_vars=[
        "Allotted_Rank_2020", "Allotted_Rank_2021",
        "Allotted_Rank_2022", "Allotted_Rank_2023", "Allotted_Rank_2024"
    ],
    var_name="Year", value_name="Closing_Rank"
)
df_long["Year"] = df_long["Year"].str.extract(r"(\d+)").astype(int)
df_long = df_long.dropna(subset=["Closing_Rank"])


predictions = []

for (college, course, category), group in df_long.groupby(["College", "Course", "Category"]):
    if len(group) >= 2:  # Need at least 2 points for regression
        X = group["Year"].values.reshape(-1, 1)
        y = group["Closing_Rank"].values
        model = LinearRegression()
        model.fit(X, y)
        predicted_rank = model.predict(np.array([[2025]]))[0]
    else:
        # if one data is found, just use that value as prediction
        predicted_rank = group["Closing_Rank"].iloc[0]
    
    predictions.append({
        "College": college,
        "Course": course,
        "Category": category,
        "Predicted_Rank_2025": float(predicted_rank)
    })

# Store in MongoDB 
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

collection.delete_many({})
collection.insert_many(predictions)

print(f"Inserted {len(predictions)} per-college predictions into MongoDB successfully!")
