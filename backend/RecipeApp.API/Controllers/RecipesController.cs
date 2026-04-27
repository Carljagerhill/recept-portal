using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecipeApp.API.Data;
using RecipeApp.API.DTOs;
using RecipeApp.API.Models;
using RecipeApp.API.Services;

namespace RecipeApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RecipesController(AppDbContext db, ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<RecipeListItemDto>>> GetAll(
        [FromQuery] string? category,
        [FromQuery] string? cuisine,
        [FromQuery] string? difficulty,
        [FromQuery] string? diet,
        [FromQuery] string? search)
    {
        var userId = currentUser.UserId;

        var query = db.Recipes.AsQueryable()
            .Where(r => r.IsPublic || r.CreatedBy == userId);

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(r => r.Category == category);
        if (!string.IsNullOrWhiteSpace(cuisine))
            query = query.Where(r => r.Cuisine == cuisine);
        if (!string.IsNullOrWhiteSpace(difficulty))
            query = query.Where(r => r.Difficulty == difficulty);
        if (!string.IsNullOrWhiteSpace(diet))
            query = query.Where(r => r.DietTags.Contains(diet));
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(r => r.Title.ToLower().Contains(search.ToLower()));

        var recipes = await query
            .OrderByDescending(r => r.UpdatedAt)
            .Select(r => new RecipeListItemDto(
                r.Id, r.Title, r.Description, r.Servings,
                r.PrepTimeMinutes, r.CookTimeMinutes, r.Difficulty,
                r.Category, r.Cuisine, r.DietTags, r.IsPublic,
                r.CurrentVersion, r.CreatedBy, r.CreatedAt))
            .ToListAsync();

        return Ok(recipes);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<RecipeDetailDto>> GetById(Guid id)
    {
        var userId = currentUser.UserId;
        var recipe = await db.Recipes
            .Include(r => r.Ingredients)
            .Include(r => r.Steps)
            .Include(r => r.NutritionalInfo)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (recipe == null) return NotFound();
        if (!recipe.IsPublic && recipe.CreatedBy != userId) return Forbid();

        return Ok(MapDetail(recipe));
    }

    [HttpPost]
    public async Task<ActionResult<RecipeDetailDto>> Create([FromBody] CreateRecipeDto dto)
    {
        var recipe = new Recipe
        {
            Title = dto.Title,
            Description = dto.Description,
            Servings = dto.Servings,
            PrepTimeMinutes = dto.PrepTimeMinutes,
            CookTimeMinutes = dto.CookTimeMinutes,
            Difficulty = dto.Difficulty,
            Category = dto.Category,
            Cuisine = dto.Cuisine,
            DietTags = dto.DietTags ?? [],
            IsPublic = dto.IsPublic,
            CreatedBy = currentUser.UserId,
        };

        db.Recipes.Add(recipe);
        await db.SaveChangesAsync();

        recipe = await db.Recipes
            .Include(r => r.Ingredients)
            .Include(r => r.Steps)
            .Include(r => r.NutritionalInfo)
            .FirstAsync(r => r.Id == recipe.Id);

        return CreatedAtAction(nameof(GetById), new { id = recipe.Id }, MapDetail(recipe));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<RecipeDetailDto>> Update(Guid id, [FromBody] UpdateRecipeDto dto)
    {
        var userId = currentUser.UserId;
        var recipe = await db.Recipes
            .Include(r => r.Ingredients)
            .Include(r => r.Steps)
            .Include(r => r.NutritionalInfo)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (recipe == null) return NotFound();
        if (recipe.CreatedBy != userId) return Forbid();

        recipe.Title = dto.Title;
        recipe.Description = dto.Description;
        recipe.Servings = dto.Servings;
        recipe.PrepTimeMinutes = dto.PrepTimeMinutes;
        recipe.CookTimeMinutes = dto.CookTimeMinutes;
        recipe.Difficulty = dto.Difficulty;
        recipe.Category = dto.Category;
        recipe.Cuisine = dto.Cuisine;
        recipe.DietTags = dto.DietTags ?? [];
        recipe.IsPublic = dto.IsPublic;
        recipe.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return Ok(MapDetail(recipe));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = currentUser.UserId;
        var recipe = await db.Recipes.FindAsync(id);

        if (recipe == null) return NotFound();
        if (recipe.CreatedBy != userId) return Forbid();

        db.Recipes.Remove(recipe);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static RecipeDetailDto MapDetail(Recipe r) => new(
        r.Id, r.Title, r.Description, r.Servings, r.PrepTimeMinutes,
        r.CookTimeMinutes, r.Difficulty, r.Category, r.Cuisine,
        r.DietTags, r.IsPublic, r.CurrentVersion, r.CreatedBy,
        r.CreatedAt, r.UpdatedAt,
        r.Ingredients.OrderBy(i => i.SortOrder).Select(i => new IngredientDto(i.Id, i.Name, i.Quantity, i.Unit, i.PricePerUnit, i.SortOrder)).ToList(),
        r.Steps.OrderBy(s => s.StepNumber).Select(s => new RecipeStepDto(s.Id, s.StepNumber, s.Instruction)).ToList(),
        r.NutritionalInfo == null ? null : new NutritionalInfoDto(r.NutritionalInfo.CaloriesPerServing, r.NutritionalInfo.ProteinG, r.NutritionalInfo.CarbsG, r.NutritionalInfo.FatG, r.NutritionalInfo.FiberG)
    );
}
