using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecipeApp.API.Data;
using RecipeApp.API.DTOs;
using RecipeApp.API.Models;
using RecipeApp.API.Services;

namespace RecipeApp.API.Controllers;

[ApiController]
[Route("api/recipes/{recipeId:guid}/nutrition")]
[Authorize]
public class NutritionController(AppDbContext db, ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<NutritionalInfoDto>> Get(Guid recipeId)
    {
        var recipe = await db.Recipes.FindAsync(recipeId);
        if (recipe == null) return NotFound();
        if (!recipe.IsPublic && recipe.CreatedBy != currentUser.UserId) return Forbid();

        var info = await db.NutritionalInfos.FindAsync(recipeId);
        if (info == null) return NotFound();

        return Ok(new NutritionalInfoDto(info.CaloriesPerServing, info.ProteinG, info.CarbsG, info.FatG, info.FiberG));
    }

    [HttpPut]
    public async Task<ActionResult<NutritionalInfoDto>> Upsert(Guid recipeId, [FromBody] UpdateNutritionalInfoDto dto)
    {
        var recipe = await db.Recipes.FindAsync(recipeId);
        if (recipe == null) return NotFound();
        if (recipe.CreatedBy != currentUser.UserId) return Forbid();

        var info = await db.NutritionalInfos.FindAsync(recipeId);
        if (info == null)
        {
            info = new NutritionalInfo { RecipeId = recipeId };
            db.NutritionalInfos.Add(info);
        }

        info.CaloriesPerServing = dto.CaloriesPerServing;
        info.ProteinG = dto.ProteinG;
        info.CarbsG = dto.CarbsG;
        info.FatG = dto.FatG;
        info.FiberG = dto.FiberG;
        info.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return Ok(new NutritionalInfoDto(info.CaloriesPerServing, info.ProteinG, info.CarbsG, info.FatG, info.FiberG));
    }
}
