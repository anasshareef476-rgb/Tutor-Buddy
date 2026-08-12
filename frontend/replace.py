import os

directory = r'C:\Users\anass\.gemini\antigravity-ide\scratch\ai-tutor\frontend\src'
for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            modified = False
            if "const API_BASE = 'http://localhost:8001/api/v1'" in content:
                content = content.replace("const API_BASE = 'http://localhost:8001/api/v1'", "const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1'")
                modified = True
                
            if "'http://localhost:8001/api/v1/auth/register'" in content:
                content = content.replace("'http://localhost:8001/api/v1/auth/register'", "`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1'}/auth/register`")
                modified = True
                
            if "'http://localhost:8001/api/v1/auth/login'" in content:
                content = content.replace("'http://localhost:8001/api/v1/auth/login'", "`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1'}/auth/login`")
                modified = True
                
            if "'http://localhost:8001/api/v1/progress/'" in content:
                content = content.replace("'http://localhost:8001/api/v1/progress/'", "`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1'}/progress/`")
                modified = True
                
            if modified:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f'Updated {file}')
