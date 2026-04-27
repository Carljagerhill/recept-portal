using RecipeApp.API.DTOs;
using RecipeApp.API.Models;

namespace RecipeApp.API.Services;

public class CostCalculationService
{
    public CostDto Calculate(Recipe recipe)
    {
        var breakdown = recipe.Ingredients
            .OrderBy(i => i.SortOrder)
            .Select(i =>
            {
                decimal? total = i.PricePerUnit.HasValue ? i.PricePerUnit.Value * i.Quantity : null;
                return new IngredientCostDto(i.Name, i.Quantity, i.Unit, i.PricePerUnit, total);
            })
            .ToList();

        var totalCost = breakdown
            .Where(b => b.TotalCost.HasValue)
            .Sum(b => b.TotalCost!.Value);

        var costPerServing = recipe.Servings > 0 ? totalCost / recipe.Servings : 0;

        return new CostDto(recipe.Id, recipe.Servings, totalCost, costPerServing, breakdown);
    }
}
