using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecipeApp.API.Data;
using RecipeApp.API.DTOs;
using RecipeApp.API.Services;

namespace RecipeApp.API.Controllers;

[ApiController]
[Route("api/recipes/{recipeId:guid}/versions")]
[Authorize]
public class VersionsController(AppDbContext db, ICurrentUserService currentUser, VersioningService versioningService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<RecipeVersionDto>>> GetAll(Guid recipeId)
    {
        var recipe = await db.Recipes.FindAsync(recipeId);
        if (recipe == null) return NotFound();
        if (!recipe.IsPublic && recipe.CreatedBy != currentUser.UserId) return Forbid();

        var versions = await db.RecipeVersions
            .Where(v => v.RecipeId == recipeId)
            .OrderByDescending(v => v.VersionNumber)
            .ToListAsync();

        return Ok(versions.Select(v => new RecipeVersionDto(
            v.Id, v.VersionNumber, v.Title, v.Description,
            v.Servings, v.ChangeNote, v.CreatedBy, v.CreatedAt,
            v.Snapshot.RootElement)));
    }

    [HttpPost]
    public async Task<ActionResult<RecipeVersionDto>> Create(Guid recipeId, [FromBody] CreateVersionDto dto)
    {
        var recipe = await db.Recipes
            .Include(r => r.Ingredients)
            .Include(r => r.Steps)
            .FirstOrDefaultAsync(r => r.Id == recipeId);

        if (recipe == null) return NotFound();
        if (recipe.CreatedBy != currentUser.UserId) return Forbid();

        var version = await versioningService.CreateVersionAsync(recipe, currentUser.UserId, dto.ChangeNote);

        return Ok(new RecipeVersionDto(
            version.Id, version.VersionNumber, version.Title,
            version.Description, version.Servings, version.ChangeNote,
            version.CreatedBy, version.CreatedAt, version.Snapshot.RootElement));
    }
}
