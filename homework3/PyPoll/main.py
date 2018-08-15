# Modules
import os
import csv
#import sys

# Create voter results dictionary
voterResultsDict = {}

# Set path for files
csvpath = os.path.join(".", "Resources", "election_data.csv")
output_path = os.path.join("poll_results.txt")

# Open the CSV
with open(csvpath, newline="", encoding="utf8") as csvfile:
    csvreader = csv.reader(csvfile, delimiter=",")
    # data has header so use this to take out of lower loop
    csv_header = next(csvreader)

    # Loop through create lists for required data
    for row in csvreader:
        #check if we already have canidate in voter results
        if(row[2] in voterResultsDict.keys()):
            # Increment voter count for canidate
            voterResultsDict[row[2]]["vote count"] = voterResultsDict[row[2]]["vote count"] + 1
        else:
             # Create new entry for canidate
             # Don't need to create dictionary in dictionary but more for experimenting
             voterResultsDict[row[2]] = {}
             voterResultsDict[row[2]]["name"] = row[2]
             voterResultsDict[row[2]]["vote count"] = 1

totalVotes = 0
voteWinner = 0
# Figure out winner and tally total vote count
for x in voterResultsDict:
    totalVotes = totalVotes + voterResultsDict[x]["vote count"]
    if(voterResultsDict[x]["vote count"] > voteWinner):
        winner = x
        voteWinner = voterResultsDict[x]["vote count"]

# Output voter results
print ("\n\nElection Results")
print("----------------------------")
print(f'Total Votes: {totalVotes}')
print("----------------------------")
for x in voterResultsDict:
    print(f'{x}: ' + "{:.3%}".format(float(voterResultsDict[x]["vote count"])/float(totalVotes)) + f' ({voterResultsDict[x]["vote count"]})')
print("----------------------------")
print(f'Winner: {winner}')
print("----------------------------")

# Output voter results to text file
with open(output_path, 'w') as f:
    f.write("Election Results\n")
    f.write("----------------------------\n")
    f.write(f'Total Votes: {totalVotes}\n')
    f.write("----------------------------\n")
    for x in voterResultsDict:
        f.write(f'{x}: ' + "{:.3%}".format(float(voterResultsDict[x]["vote count"])/float(totalVotes)) + f' ({voterResultsDict[x]["vote count"]})\n')
    f.write("----------------------------\n")
    f.write(f'Winner: {winner}\n')
    f.write("----------------------------\n")
    
#print("All Done!")