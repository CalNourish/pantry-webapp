import json
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import datetime
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

weekly_sum = df.groupby('week #')['Quantity'].sum()
weekly_sum.plot(kind='line')

grouped_data = df.groupby('General Name')['Quantity'].sum()

filtered_df = df[df['week #'] == 58]
filtered_df = filtered_df[filtered_df['weekday'] == "Monday"]
filtered_df = filtered_df[filtered_df['Time'].notna()]
filtered_df['hour'] = filtered_df['Time'].str.split(':').str[0].astype(int)

grouped_by_hour_people = filtered_df.groupby(['hour', 'people #']).size().reset_index(name='count')
grouped_by_hour_people = grouped_by_hour_people.drop(columns=['count'])

grouped = grouped_by_hour_people.groupby(['hour']).size().reset_index(name='count')

def ave_ppl_per_hour_vis(dataframe, day, week_num):
    maxval = dataframe['week #'].max()-1

    container = []
    for i in np.arange(week_num): 
        container = container + [maxval - i]
    filtered_df = df[df["week #"].isin(container)]
    filtered_df = filtered_df[filtered_df['weekday'] == day]
    filtered_df = filtered_df[filtered_df['Time'].notna()]
    filtered_df['hour'] = filtered_df['Time'].str.split(':').str[0].astype(int)

    grouped_by_hour_people = filtered_df.groupby(['hour', 'people #']).size().reset_index(name='count')
    grouped_by_hour_people = grouped_by_hour_people.drop(columns=['count'])

    grouped = grouped_by_hour_people.groupby(['hour']).size().reset_index(name='count')
    grouped["count"] = grouped["count"] / week_num

    result = grouped.set_index('hour').to_dict()['count']
    result = { str(k): v for k, v in result.items() }
    return json.dumps(result)

print(ave_ppl_per_hour_vis(df, sys.argv[2], int(sys.argv[1])))
sys.stdout.flush()