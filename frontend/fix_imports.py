#!/usr/bin/env python3
import os
import re

files_to_fix = [
    ("src/contexts/LanguageContext.tsx", "../config"),
    ("src/components/HomePage.tsx", "../config"),
    ("src/components/Header.tsx", "../config"),
    ("src/components/RegisterForm.tsx", "../config"),
    ("src/components/DonationPage.tsx", "../config"),
    ("src/components/art-sales/ArtSaleDetail.tsx", "../../config"),
    ("src/components/art-sales/ArtSaleList.tsx", "../../config"),
    ("src/components/art-sales/ArtSalePostForm.tsx", "../../config"),
    ("src/components/flea-market/FleaMarketChats.tsx", "../../config"),
    ("src/components/jewelry/JewelryCart.tsx", "../../config"),
    ("src/components/jewelry/JewelryCheckout.tsx", "../../config"),
    ("src/components/jewelry/JewelryOrderComplete.tsx", "../../config"),
    ("src/components/jewelry/JewelryProductDetail.tsx", "../../config"),
    ("src/components/jewelry/JewelryProductList.tsx", "../../config"),
    ("src/components/matching/MatchingProfileDetailPage.tsx", "../../config"),
    ("src/components/salon/CreateSalonRoomModal.tsx", "../../config"),
    ("src/components/salon/SalonPage.tsx", "../../config"),
    ("src/components/salon/SalonRoomDetailPage.tsx", "../../config"),
    ("src/pages/members/AccountPage.tsx", "../../config"),
    ("src/pages/members/FleaMarketChatPage.tsx", "../../config"),
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
    
    # Remove the const API_URL line
    pattern = r'const API_URL = import\.meta\.env\.VITE_API_URL \|\| ["\']http://localhost:8000["\'];?\n?'
    if not re.search(pattern, content):
        print(f"Skipping {filepath} (no API_URL const found)")
        continue
    
    content = re.sub(pattern, '', content)
    
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

print("Done!")
