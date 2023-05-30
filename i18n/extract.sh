#!/bin/bash

input_file="polish.yml"
output_file="polish2.txt"

# Check if the input file exists
if [ ! -f "$input_file" ]; then
  echo "Input file '$input_file' does not exist."
  exit 1
fi

# Clear the output file if it already exists
if [ -f "$output_file" ]; then
  > "$output_file"
fi

# Extract and write the right part after ":" to the output file
while IFS=: read -r key value; do
  trimmed_value=$(echo "$value" | awk '{$1=$1};1')
  echo "$trimmed_value" >> "$output_file"
done < "$input_file"

echo "Extraction completed. Output written to '$output_file'."
