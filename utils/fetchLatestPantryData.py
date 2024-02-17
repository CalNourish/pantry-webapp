import pandas as pd

def fetch_pantry_data(spreadsheet_id):
    url = f"https://docs.google.com/spreadsheets/d/{spreadsheet_id}/export?format=csv"
    df = pd.read_csv(url)
    df.to_csv("utils/data.csv")

fetch_pantry_data("1waiCSO7hm8kmWLaG8OdB8_7ksfEbm_B3CyKHbXTIf5E")
