#!/usr/bin/env python3
import os
import re

files_to_fix = [
    ("src/components/PostDetailModal.tsx", "../config"),
    ("src/pages/members/FoodPage.tsx", "../../config"),
    ("src/pages/members/BeautyPage.tsx", "../../config"),
    ("src/components/LiveWeddingApplicationForm.tsx", "../config"),
    ("src/hooks/usePremium.ts", "../config"),
    ("src/components/CategoryPage.tsx", "../config"),
    ("src/components/CategoryPageNew.tsx", "../config"),
    ("src/components/BlogListPage.tsx", "../config"),
    ("src/components/NewPostForm.tsx", "../config"),
    ("src/components/ProfilePage.tsx", "../config"),
    ("src/components/CreatePost.tsx", "../config"),
    ("src/components/PostFeed.tsx", "../config"),
    ("src/components/BlogDetailPage.tsx", "../config"),
    ("src/components/jewelry/JewelryAdmin.tsx", "../../config"),
    ("src/components/CategoryNavigation.tsx", "../config"),
    ("src/utils/imageUtils.ts", "../config"),
    ("src/components/matching/PaidMemberGate.tsx", "../../config"),
    ("src/components/matching/MatchingProfileDetailPage.tsx", "../../config"),
    ("src/components/matching/MatchingMatchesPage.tsx", "../../config"),
    ("src/components/matching/MatchingChatsPage.tsx", "../../config"),
]

for filepath, config_path in files_to_fix:
    if not os.path.exists(filepath):
        print(f"Skipping {filepath} (not found)")
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if already has API_URL import from config
    if re.search(r'import.*\{.*API_URL.*\}.*from.*["\'].*config["\']', content):
        print(f"Skipping {filepath} (already has config import)")
        continue
    
    modified = False
    
    # Pattern 1: const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000';
    pattern1 = r'const API_URL = \(import\.meta as any\)\.env\.VITE_API_URL \|\| ["\']http://localhost:8000["\'];?\n?'
    if re.search(pattern1, content):
        content = re.sub(pattern1, '', content)
        modified = True
    
    # Pattern 2: const API_BASE_URL = import.meta.env.VITE_API_URL || ...
    pattern2 = r'const API_BASE_URL = import\.meta\.env\.VITE_API_URL.*["\']http://localhost:8000["\'];?\n?'
    if re.search(pattern2, content):
        content = re.sub(pattern2, '', content)
        # Also replace API_BASE_URL with API_URL in the file
        content = content.replace('API_BASE_URL', 'API_URL')
        modified = True
    
    # Pattern 3: inline usage like ${import.meta.env.VITE_API_URL || 'http://localhost:8000'}
    pattern3 = r'\$\{import\.meta\.env\.VITE_API_URL \|\| ["\']http://localhost:8000["\']\}'
    if re.search(pattern3, content):
        content = re.sub(pattern3, '${API_URL}', content)
        modified = True
    
    if modified:
        # Add import after the last import statement
        import_pattern = r'(import .+;\n)(?!import)'
        matches = list(re.finditer(import_pattern, content))
        if matches:
            last_import = matches[-1]
            insert_pos = last_import.end()
            new_import = f'import {{ API_URL }} from \'{config_path}\';\n'
            content = content[:insert_pos] + new_import + content[insert_pos:]
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed: {filepath}")
        else:
            print(f"Warning: No import statements found in {filepath}")
    else:
        print(f"Skipping {filepath} (no localhost:8000 pattern found)")

print("Done!")
