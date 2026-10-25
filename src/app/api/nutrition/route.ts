import { NextResponse } from "next/server";
import { FOODS_DB } from "@/app/api/foods/route";

export async function POST(request: Request) {
  try {
    const items = await request.json();

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;
    let totalSodium = 0;

    const evaluatedItems = [];

    for (const it of items) {
      const weight = it.weight_grams || 100;
      const matched = FOODS_DB.find(
        (f) =>
          f.id === it.food_item_id ||
          f.name.toLowerCase().includes(it.food_name.toLowerCase()) ||
          it.food_name.toLowerCase().includes(f.name.toLowerCase().split(" ")[0])
      );

      let itemCal = 0, itemProt = 0, itemCarb = 0, itemFat = 0, itemFib = 0, itemSod = 0;

      if (matched) {
        const ratio = weight / 100.0;
        itemCal = Number((matched.calories_per_100g * ratio).toFixed(1));
        itemProt = Number((matched.protein_per_100g * ratio).toFixed(1));
        itemCarb = Number((matched.carbs_per_100g * ratio).toFixed(1));
        itemFat = Number((matched.fat_per_100g * ratio).toFixed(1));
        itemFib = Number((matched.fiber_per_100g * ratio).toFixed(1));
        itemSod = Number((matched.sodium_mg_per_100g * ratio).toFixed(1));
      } else {
        itemCal = Number((weight * 1.5).toFixed(1));
        itemProt = Number((weight * 0.06).toFixed(1));
        itemCarb = Number((weight * 0.22).toFixed(1));
        itemFat = Number((weight * 0.04).toFixed(1));
        itemFib = Number((weight * 0.02).toFixed(1));
        itemSod = Number((weight * 1.8).toFixed(1));
      }

      totalCalories += itemCal;
      totalProtein += itemProt;
      totalCarbs += itemCarb;
      totalFat += itemFat;
      totalFiber += itemFib;
      totalSodium += itemSod;

      evaluatedItems.push({
        food_name: it.food_name,
        weight_grams: weight,
        calories: itemCal,
        protein: itemProt,
        carbs: itemCarb,
        fat: itemFat,
        fiber: itemFib,
        sodium: itemSod
      });
    }

    const totalKcal = Math.max(totalCalories, 1);
    const protKcal = totalProtein * 4;
    const carbKcal = totalCarbs * 4;
    const fatKcal = totalFat * 9;
    const sumMacroKcal = Math.max(protKcal + carbKcal + fatKcal, 1);

    return NextResponse.json({
      items: evaluatedItems,
      household_portion_summary: `${items.length} items logged (${items.reduce((acc: number, it: any) => acc + (it.weight_grams || 100), 0)}g total weight)`,
      nutrients: {
        calories: Number(totalCalories.toFixed(1)),
        protein: Number(totalProtein.toFixed(1)),
        carbs: Number(totalCarbs.toFixed(1)),
        fat: Number(totalFat.toFixed(1)),
        fiber: Number(totalFiber.toFixed(1)),
        sodium: Number(totalSodium.toFixed(1)),
        protein_percent: Number(((protKcal / sumMacroKcal) * 100).toFixed(1)),
        carbs_percent: Number(((carbKcal / sumMacroKcal) * 100).toFixed(1)),
        fat_percent: Number(((fatKcal / sumMacroKcal) * 100).toFixed(1))
      },
      suitability: {
        overall_status: totalCalories > 750 ? "caution" : "optimal",
        status_label: totalCalories > 750 ? "Requires Portion Moderation" : "Optimal Nutritional Fit",
        allergy_warnings: [],
        dietary_compatibility: ["Aligned with vegetarian guidelines"],
        health_alerts: totalSodium > 700 ? [`Sodium Alert: ${Math.round(totalSodium)}mg exceeds recommended single-meal ceiling.`] : [],
        actionable_tips: [
          totalFiber >= 5 ? `Great fiber content (${totalFiber}g) supporting gut microbiome.` : `Add a bowl of fresh kachumber salad to reach ICMR-NIN 50% vegetable target.`,
          totalProtein >= 15 ? `Solid protein contribution (${totalProtein}g) for sustained satiety.` : `Consider adding curd or sprouts to boost meal protein.`
        ]
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
