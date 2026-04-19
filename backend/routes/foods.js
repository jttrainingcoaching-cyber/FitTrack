const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// Common whole foods database — always available, no API needed
const COMMON_FOODS = [
  { name: 'Chicken Breast (cooked)',    calories: 165, protein: 31,  carbs: 0,   fat: 3.6, serving: '100g' },
  { name: 'Ground Beef 80/20 (cooked)', calories: 254, protein: 26,  carbs: 0,   fat: 17,  serving: '100g' },
  { name: 'Salmon (cooked)',            calories: 208, protein: 28,  carbs: 0,   fat: 10,  serving: '100g' },
  { name: 'Tuna (canned in water)',     calories: 116, protein: 26,  carbs: 0,   fat: 1,   serving: '100g' },
  { name: 'Eggs (large)',               calories: 78,  protein: 6,   carbs: 0.6, fat: 5,   serving: '1 egg' },
  { name: 'Egg Whites',                 calories: 52,  protein: 11,  carbs: 0.7, fat: 0.2, serving: '100g' },
  { name: 'Greek Yogurt (0% fat)',      calories: 59,  protein: 10,  carbs: 3.6, fat: 0.4, serving: '100g' },
  { name: 'Cottage Cheese (low fat)',   calories: 72,  protein: 12,  carbs: 2.7, fat: 1,   serving: '100g' },
  { name: 'Whey Protein Powder',        calories: 120, protein: 24,  carbs: 3,   fat: 1.5, serving: '1 scoop (30g)' },
  { name: 'Turkey Breast (cooked)',     calories: 135, protein: 30,  carbs: 0,   fat: 1,   serving: '100g' },

  { name: 'White Rice (cooked)',        calories: 206, protein: 4.3, carbs: 45,  fat: 0.4, serving: '1 cup' },
  { name: 'Brown Rice (cooked)',        calories: 216, protein: 5,   carbs: 45,  fat: 1.8, serving: '1 cup' },
  { name: 'Oats (dry)',                 calories: 389, protein: 17,  carbs: 66,  fat: 7,   serving: '100g' },
  { name: 'Sweet Potato (cooked)',      calories: 90,  protein: 2,   carbs: 21,  fat: 0.1, serving: '100g' },
  { name: 'Pasta (cooked)',             calories: 220, protein: 8,   carbs: 43,  fat: 1.3, serving: '1 cup' },
  { name: 'Bread (whole wheat)',        calories: 81,  protein: 4,   carbs: 14,  fat: 1.1, serving: '1 slice' },
  { name: 'Banana',                     calories: 89,  protein: 1.1, carbs: 23,  fat: 0.3, serving: '1 medium' },
  { name: 'Apple',                      calories: 95,  protein: 0.5, carbs: 25,  fat: 0.3, serving: '1 medium' },
  { name: 'Quinoa (cooked)',            calories: 222, protein: 8,   carbs: 39,  fat: 3.6, serving: '1 cup' },
  { name: 'Black Beans (cooked)',       calories: 227, protein: 15,  carbs: 41,  fat: 0.9, serving: '1 cup' },

  { name: 'Avocado',                    calories: 320, protein: 4,   carbs: 17,  fat: 29,  serving: '1 whole' },
  { name: 'Olive Oil',                  calories: 119, protein: 0,   carbs: 0,   fat: 14,  serving: '1 tbsp' },
  { name: 'Almonds',                    calories: 164, protein: 6,   carbs: 6,   fat: 14,  serving: '1 oz (28g)' },
  { name: 'Peanut Butter',              calories: 188, protein: 8,   carbs: 6,   fat: 16,  serving: '2 tbsp' },
  { name: 'Whole Milk',                 calories: 149, protein: 8,   carbs: 12,  fat: 8,   serving: '1 cup' },
  { name: 'Cheddar Cheese',             calories: 113, protein: 7,   carbs: 0.4, fat: 9,   serving: '1 oz (28g)' },

  { name: 'Broccoli (cooked)',          calories: 55,  protein: 3.7, carbs: 11,  fat: 0.6, serving: '1 cup' },
  { name: 'Spinach (raw)',              calories: 7,   protein: 0.9, carbs: 1.1, fat: 0.1, serving: '1 cup' },
  { name: 'Mixed Greens',              calories: 10,  protein: 1,   carbs: 2,   fat: 0,   serving: '1 cup' },
  { name: 'Bell Pepper',                calories: 31,  protein: 1,   carbs: 6,   fat: 0.3, serving: '1 medium' },

  { name: 'Protein Bar (avg)',          calories: 200, protein: 20,  carbs: 22,  fat: 7,   serving: '1 bar' },
  { name: 'Granola Bar',               calories: 190, protein: 4,   carbs: 29,  fat: 7,   serving: '1 bar' },
  { name: 'Orange Juice',              calories: 112, protein: 1.7, carbs: 26,  fat: 0.5, serving: '1 cup' },
];

// GET /api/foods/search?q=chicken
router.get('/search', async (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  if (!q || q.length < 2) return res.json([]);

  // 1. Search common foods first (instant)
  const local = COMMON_FOODS.filter(f => f.name.toLowerCase().includes(q));

  // 2. Also call OpenFoodFacts for branded/packaged products
  let remote = [];
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=10&fields=product_name,nutriments,brands`;
    const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
    const data = await response.json();
    if (data.products) {
      remote = data.products
        .filter(p => p.product_name && p.nutriments?.['energy-kcal_100g'])
        .slice(0, 8)
        .map(p => ({
          name:     p.brands ? `${p.product_name} (${p.brands})` : p.product_name,
          calories: Math.round(p.nutriments['energy-kcal_100g']   || 0),
          protein:  Math.round((p.nutriments['proteins_100g']      || 0) * 10) / 10,
          carbs:    Math.round((p.nutriments['carbohydrates_100g'] || 0) * 10) / 10,
          fat:      Math.round((p.nutriments['fat_100g']           || 0) * 10) / 10,
          serving:  '100g',
          source:   'openfoodfacts',
        }));
    }
  } catch {
    // If OpenFoodFacts is unavailable, just use local results
  }

  res.json([...local, ...remote].slice(0, 15));
});

module.exports = router;
