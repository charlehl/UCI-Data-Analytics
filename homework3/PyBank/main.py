# Modules
import os
import csv
#import sys
#from datetime import datetime

# Set path for files
csvpath = os.path.join(".", "Resources", "budget_data.csv")
output_path = os.path.join("analysis.txt")

# Open the CSV
with open(csvpath, newline="", encoding="utf8") as csvfile:
    csvreader = csv.reader(csvfile, delimiter=",")
    # data has header so use this to take out of lower loop
    csv_header = next(csvreader)

    # initialize variables for analysis
    dataCount = 0
    TotalRevenue = 0.0
    greatIncProfit = 0
    greatDecProfit = 0

    currPrice = 0.0
    # Loop through data in sheet
    for row in csvreader:
        #split entry to format for date format
        splitMonth,splitYear = row[0].split("-")
        #re-form to format we want
        dateFormat = splitMonth + "-20" + splitYear
        # record current monthly profit to compare later
        currPrice = float(row[1])
        # Keep track of total revenue
        TotalRevenue = TotalRevenue+currPrice
        # find largest profit and record date
        if(currPrice > greatIncProfit):
            greatIncProfit = currPrice
            greatIncDate = dateFormat
        # find largest loss and record date
        if(currPrice < greatDecProfit):
            greatDecProfit = currPrice
            greatDecDate = dateFormat
        # count the number of rows in data
        dataCount = dataCount+1

# Output data to terminal
print ("\n\nFinancial Analysis")
print("----------------------------")
print("Total Months: " + str(dataCount))
print ("Total: ${:,.2f}".format(TotalRevenue))
print("Average Change: ${:,.2f}".format(TotalRevenue/dataCount))
print("Greatest Increase in Profits: " + greatIncDate + " (${:,.2f})".format(greatIncProfit))
print("Greatest Decrease in Profits: " + greatDecDate + " (${:,.2f})".format(greatDecProfit))

# Output data to output file
with open(output_path, 'w') as f:
    f.write("Financial Analysis\n")
    f.write("----------------------------\n")
    f.write("Total Months: " + str(dataCount)+"\n")
    f.write ("Total: ${:,.2f}".format(TotalRevenue)+"\n")
    f.write("Average Change: ${:,.2f}".format(TotalRevenue/dataCount)+"\n")
    f.write("Greatest Increase in Profits: " + greatIncDate + " (${:,.2f})".format(greatIncProfit)+"\n")
    f.write("Greatest Decrease in Profits: " + greatDecDate + " (${:,.2f})".format(greatDecProfit)+"\n")
    
#print("All Done!")