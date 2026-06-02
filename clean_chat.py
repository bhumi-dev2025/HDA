with open(r'D:\DEVMODE\appdark\componunts\FloatingChatButton.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the closing ); of AppBottomSheet block
# We keep lines 0 to first occurrence of ");\n" after line 600
end_line = None
for i in range(600, len(lines)):
    stripped = lines[i].strip()
    if stripped == ');':
        end_line = i
        break

if end_line:
    clean = lines[:end_line+1]
    with open(r'D:\DEVMODE\appdark\componunts\FloatingChatButton.tsx', 'w', encoding='utf-8') as f:
        f.writelines(clean)
    print(f"Done! Kept {end_line+1} lines, removed {len(lines)-end_line-1} lines")
else:
    print("End not found")
