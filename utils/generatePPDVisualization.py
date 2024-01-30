import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import datetime
import json
import sys

df = pd.read_csv('utils/Pantry Checkout Log - AY 22-23 (2).csv')
df = df[df['Quantity'] != 4041570054161]
df = df[df['Quantity'] != 4024182025064]
df = df[df['Quantity'] != 2027862020168]

df['datetime'] = pd.to_datetime(df['Date'])
df['datetime'].ffill(inplace=True)

# Create a new column 'weekday' with the names of the weekdays
df['weekday'] = df['datetime'].dt.day_name()
df['timefilled'] = df['Time'].ffill()

# Calculate the difference in days from the start date
df['days_from_start'] = (df['datetime'] - df['datetime'].min()).dt.days

# Calculate the week number starting from 0
df['week #'] = df['days_from_start'] // 7

# Drop the 'days_from_start' column as it's no longer needed
df.drop('days_from_start', axis=1, inplace=True)

# Add people # column
counter = 0
week_nums = []

for date in df['Date']:
    if pd.notna(date):
        counter += 1
    week_nums.append(counter)

df['people #'] = week_nums


def categorize_item(item_name):
    item_name = item_name.lower()
    if 'tofu' in item_name:
        return 'Tofu'
    elif 'macaroni' in item_name or 'pasta' in item_name:
        return 'Pasta'
    elif 'soy milk' in item_name:
        return 'Soy Milk'
    elif 'almond' in item_name and 'milk' in item_name:
        return 'Almond Milk'
    elif 'apple' in item_name:
        return 'Fruit'
    elif 'sauce' in item_name:
        return 'Sauce'
    elif 'juice' in item_name:
        return 'Juice'
    elif 'rice' in item_name:
        return 'Grains'
    # This will cover any other beverages, but feel free to refine it.
    elif 'drink' in item_name or 'beverage' in item_name:
        return 'Beverages'
    # Assuming 'original' refers to some kind of base product. Adjust as needed.
    elif 'original' in item_name:
        return 'Basics'
    else:
        return 'Miscellaneous'  # Just in case we missed any item

df['General Name'] = df['Item Name'].apply(categorize_item)

def weekly_frequency(week_num):
    maxval = max(df['week #']) - 1
    valid_weeks = []
    total_distr = []
    for i in range(week_num):
        valid_weeks = valid_weeks + [maxval - i]

    for i in range(len(valid_weeks)):
        df1 = df[df['week #'] == valid_weeks[i]]
        df1 = df1[df1["Time"].notna()]
        weekly_distr1 = df1['weekday'].value_counts().sort_index()
        total_distr += [weekly_distr1]
    
    
    #average_distr = total_distr / week_num

    #return total_distr
    #average_distr = sum(total_distr) / week_num
    total_distr = pd.concat(total_distr, axis=1).fillna(0)

    # Calculate the average distribution across weeks
    average_distr = total_distr.mean(axis=1)
    #return average_distr
    #final = {{"Monday": , "Tue"}
    #for week in total_distr:

    
    # Define the custom order of the days of the week
    custom_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    # Sort the 'average_distr' Series by the custom order
    average_distr = average_distr.reindex(custom_order)

    result = { str(k): v for k, v in average_distr.items() }
    result["title"] = f"Average Frequency of Food Pantry Visits for Last {str(week_num)} Weeks"
    return json.dumps(result)
    
print(weekly_frequency(int(sys.argv[1])))
sys.stdout.flush()