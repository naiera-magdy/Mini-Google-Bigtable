import pandas as pd


data = pd.read_csv("netflix_titles.csv")

print(data.shape[0])
print(data["title"].is_unique)