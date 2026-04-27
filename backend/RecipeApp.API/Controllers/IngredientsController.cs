using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecipeApp.API.Data;
using RecipeApp.API.DTOs;
using RecipeApp.API.Models;
using RecipeApp.API.Services;

namespace RecipeApp.API.Controllers;

[ApiController]
[Route("api/recipes/{recipeId:guid}/ingredients")]
[Authorize]
public class IngredientsController(AppDbContext db, ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<IngredientDto>>> GetAll(Guid recipeId)
    {
        var recipe = await db.Recipes.FindAsync(recipeId);
        if (recipe == null) return NotFound();
        if (!recipe.IsPublic && recipe.CreatedBy != currentUser.UserId) return Forbid();

        var ingredients = await db.Ingredients
            .Where(i => i.RecipeId == recipeId)
            .OrderBy(i => i.SortOrder)
            .Select(i => new IngredientDto(i.Id, i.Name, i.Quantity, i.Unit, i.PricePerUnit, i.SortOrder))
            .ToListAsync();

        return Ok(ingredients);
    }

    [HttpPost]
    public async Task<ActionResult<IngredientDto>> Create(Guid recipeId, [FromBody] CreateIngredientDto dto)
    {
        var recipe = await db.Recipes.FindAsync(recipeId);
        if (recipe == null) return NotFound();
        if (recipe.CreatedBy != currentUser.UserId) return Forbid();

        var ingredient = new Ingredient
        {
            RecipeId = recipeId,
            Name = dto.Name,
            Quantity = dto.Quantity,
            Unit = dto.Unit,
            PricePerUnit = dto.PricePerUnit,
            SortOrder = dto.SortOrder,
        };

        db.Ingredients.Add(ingredient);
        recipe.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { recipeId },
            new IngredientDto(ingredient.Id, ingredient.Name, ingredient.Quantity, ingredient.Unit, ingredient.PricePerUnit, ingredient.SortOrder));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<IngredientDto>> Update(Guid recipeId, Guid id, [FromBody] UpdateIngredientDto dto)
    {
        var recipe = await db.Recipes.FindAsync(recipeId);
        if (recipe == null) return NotFound();
        if (recipe.CreatedBy != currentUser.UserId) return Forbid();

        var ingredient = await db.Ingredients.FirstOrDefaultAsync(i => i.Id == id && i.RecipeId == recipeId);
        if (ingredient == null) return NotFound();

        ingredient.Name = dto.Name;
        ingredient.Quantity = dto.Quantity;
        ingredient.Unit = dto.Unit;
        ingredient.PricePerUnit = dto.PricePerUnit;
        ingredient.SortOrder = dto.SortOrder;
        recipe.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return Ok(new IngredientDto(ingredient.Id, ingredient.Name, ingredient.Quantity, ingredient.Unit, ingredient.PricePerUnit, ingredient.SortOrder));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid recipeId, Guid id)
    {
        var recipe = await db.Recipes.FindAsync(recipeId);
        if (recipe == null) return NotFound();
        if (recipe.CreatedBy != currentUser.UserId) return Forbid();

        var ingredient = await db.Ingredients.FirstOrDefaultAsync(i => i.Id == id && i.RecipeId == recipeId);
        if (ingredient == null) return NotFound();

        db.Ingredients.Remove(ingredient);
        recipe.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return NoContent();
    }
}
