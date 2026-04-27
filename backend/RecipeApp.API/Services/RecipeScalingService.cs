using RecipeApp.API.DTOs;
using RecipeApp.API.Models;

namespace RecipeApp.API.Services;

public class RecipeScalingService
{
    public ScaledRecipeDto Scale(Recipe recipe, int targetServings)
    {
        if (recipe.Servings <= 0) throw new InvalidOperationException("Recipe servings must be greater than zero.");

        var factor = (decimal)targetServings / recipe.Servings;

        var scaledIngredients = recipe.Ingredients
            .OrderBy(i => i.SortOrder)
            .Select(i => new ScaledIngredientDto(
                i.Id,
                i.Name,
                i.Quantity,
                Math.Round(i.Quantity * factor, 3),
                i.Unit))
            .ToList();

        return new ScaledRecipeDto(recipe.Id, recipe.Servings, targetServings, factor, scaledIngredients);
    }
}
