using System.Text.Json;
using RecipeApp.API.Data;
using RecipeApp.API.Models;

namespace RecipeApp.API.Services;

public class VersioningService(AppDbContext db)
{
    public async Task<RecipeVersion> CreateVersionAsync(Recipe recipe, Guid userId, string? changeNote)
    {
        var snapshot = new
        {
            recipe.Title,
            recipe.Description,
            recipe.Servings,
            recipe.PrepTimeMinutes,
            recipe.CookTimeMinutes,
            recipe.Difficulty,
            recipe.Category,
            recipe.Cuisine,
            recipe.DietTags,
            Ingredients = recipe.Ingredients.OrderBy(i => i.SortOrder).Select(i => new
            {
                i.Name, i.Quantity, i.Unit, i.PricePerUnit, i.SortOrder
            }),
            Steps = recipe.Steps.OrderBy(s => s.StepNumber).Select(s => new
            {
                s.StepNumber, s.Instruction
            })
        };

        var version = new RecipeVersion
        {
            RecipeId = recipe.Id,
            VersionNumber = recipe.CurrentVersion,
            Title = recipe.Title,
            Description = recipe.Description,
            Servings = recipe.Servings,
            ChangeNote = changeNote,
            Snapshot = JsonDocument.Parse(JsonSerializer.Serialize(snapshot)),
            CreatedBy = userId,
        };

        db.RecipeVersions.Add(version);
        recipe.CurrentVersion++;
        recipe.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return version;
    }
}
