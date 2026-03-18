import os

output_file = "artexa_full_code.md"

directories_to_scan = [
    {"path": "backend/app", "name": "Backend Code"},
    {"path": "backend/scripts", "name": "DBMS, Models, and Scripts Code"},
    {"path": "frontend/src", "name": "Frontend Code"},
]

valid_extensions = {".py", ".js", ".jsx", ".css"}
exclude_dirs = {"__pycache__", "node_modules", ".git", "venv", ".next", "dist", "build", "assets"}

with open(output_file, "w", encoding="utf-8") as out:
    out.write("# Artexa Full Source Code\n\n")
    
    for item in directories_to_scan:
        out.write(f"## {item['name']}\n\n")
        base_dir = item["path"]
        if not os.path.exists(base_dir):
            out.write(f"Directory {base_dir} not found.\n\n")
            continue
            
        for root, dirs, files in os.walk(base_dir):
            filtered_dirs = [d for d in dirs if d not in exclude_dirs]
            dirs.clear()
            dirs.extend(filtered_dirs)
            
            for file in files:
                ext = os.path.splitext(file)[1]
                if ext in valid_extensions:
                    file_path = os.path.join(root, file)
                    # Use forward slashes for cross-platform aesthetic
                    display_path = file_path.replace("\\", "/")
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            content = f.read()
                        
                        out.write(f"### `{display_path}`\n\n")
                        lang = "javascript"
                        if ext == ".py":
                            lang = "python"
                        elif ext == ".css":
                            lang = "css"
                        elif ext == ".jsx":
                            lang = "jsx"
                            
                        out.write(f"```{lang}\n")
                        out.write(content)
                        if not content.endswith("\n"):
                            out.write("\n")
                        out.write("```\n\n")
                    except Exception as e:
                        out.write(f"Error reading file {file_path}: {e}\n\n")

print(f"Generated {output_file}")
