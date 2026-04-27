using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecipeApp.API.Data;
using RecipeApp.API.DTOs;
using RecipeApp.API.Services;

namespace RecipeApp.API.Controllers;

[ApiController]
[Route("api/recipes/{recipeId:guid}/scale")]
[Authorize]
public class ScalingController(AppDbContext db, ICurrentUserService currentUser, RecipeScalingService scalingService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ScaledRecipeDto>> Scale(Guid recipeId, [FromQuery] int servings)
    {
        if (servings <= 0) return BadRequest("Servings must be greater than zero.");

        var userId = currentUser.UserId;
        var recipe = await db.Recipes
            .Include(r => r.Ingredients)
            .FirstOrDefaultAsync(r => r.Id == recipeId);

        if (recipe == null) return NotFound();
        if (!recipe.IsPublic && recipe.CreatedBy != userId) return Forbid();

        return Ok(scalingService.Scale(recipe, servings));
    }
}
