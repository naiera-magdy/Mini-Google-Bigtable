from csv import reader
import csv
# open file in read mode

rows = []

from csv import reader
import csv
# open file in read mode

rows = []

a_file = open("netflix_titles_modified.csv", "r")

lines = a_file.readlines()
a_file.close()

willKeep = False
lengthOfArr = len(lines)
for i, row in enumerate(lines):
    print(lengthOfArr)
    while(lengthOfArr > 2001):
    # row variable is a list that represents a row in csv
        if(i % 2):
            willKeep = not willKeep
        if(willKeep):
            del lines[i]
            lengthOfArr = lengthOfArr - 1

new_file = open("netflix_titles_modified.csv", "w+")

for line in lines:
    new_file.write(line)

new_file.close()