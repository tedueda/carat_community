#!/bin/bash

# Fix all files that use direct import.meta.env.VITE_API_URL instead of config.ts

files=(
  "src/components/DonationPage.tsx"
  "src/components/Header.tsx"
  "src/components/HomePage.tsx"
  "src/components/RegisterForm.tsx"
  "src/components/art-sales/ArtSaleDetail.tsx"
  "src/components/art-sales/ArtSaleList.tsx"
  "src/components/art-sales/ArtSalePostForm.tsx"
  "src/components/flea-market/FleaMarketChats.tsx"
  "src/components/jewelry/JewelryCart.tsx"
  "src/components/jewelry/JewelryCheckout.tsx"
  "src/components/jewelry/JewelryOrderComplete.tsx"
  "src/components/jewelry/JewelryProductDetail.tsx"
  "src/components/jewelry/JewelryProductList.tsx"
  "src/components/matching/MatchingProfileDetailPage.tsx"
  "src/components/salon/CreateSalonRoomModal.tsx"
  "src/components/salon/SalonPage.tsx"
  "src/components/salon/SalonRoomDetailPage.tsx"
  "src/contexts/LanguageContext.tsx"
  "src/pages/members/AccountPage.tsx"
  "src/pages/members/FleaMarketChatPage.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    # Replace inline API_URL declarations with import from config
    sed -i '' 's/const API_URL = import\.meta\.env\.VITE_API_URL || .*$/import { API_URL } from "..\/config";/g' "$file"
    sed -i '' 's/const API_URL = import\.meta\.env\.VITE_API_URL || .*$/import { API_URL } from "..\/..\/config";/g' "$file"
    sed -i '' 's/const API_URL = import\.meta\.env\.VITE_API_URL || .*$/import { API_URL } from "..\/..\/..\/config";/g' "$file"
  fi
done

echo "Done!"
