#!/bin/bash

# This script reads issue data from a JSON file and creates GitHub issues.
# It's designed to be non-interactive and suitable for GitHub Actions.

# --- Configuration ---
# SCRIPT_DIR: The directory where this script and issues-data.json are located.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
ISSUES_FILE="$SCRIPT_DIR/issues-data.json"

# Check if issues file exists
if [ ! -f "$ISSUES_FILE" ]; then
  echo "Error: Issues data file not found at $ISSUES_FILE"
  exit 1
fi

echo "Reading issues from: $ISSUES_FILE"

# --- Label Setup ---
echo "Creating labels..."
jq -c '.labels[]' "$ISSUES_FILE" | while IFS= read -r label_json; do
  name=$(echo "$label_json" | jq -r '.name')
  color=$(echo "$label_json" | jq -r '.color')
  description=$(echo "$label_json" | jq -r '.description')

  echo "Creating label: $name"
  gh label create "$name" --color "$color" --description "$description" || echo "Label '$name' already exists or failed to create."
done
echo "Label creation complete."

# --- Issues Creation ---
echo "Creating issues..."
jq -c '.issues[]' "$ISSUES_FILE" | while IFS= read -r issue_json; do
  title=$(echo "$issue_json" | jq -r '.title')
  body=$(echo "$issue_json" | jq -r '.body')
  labels=$(echo "$issue_json" | jq -r '.labels | join(",")') # Comma-separated string for gh issue create

  echo "Creating issue: $title"
  # Create the issue
  gh issue create \
    --title "$title" \
    --body "$body" \
    --label "$labels"

  if [ $? -eq 0 ]; then
    echo "Successfully created issue: $title"
  else
    echo "Failed to create issue: $title"
  fi
done

echo "All issues have been processed."