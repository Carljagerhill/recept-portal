using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecipeApp.API.Data;
using RecipeApp.API.DTOs;
using RecipeApp.API.Services;

namespace RecipeApp.API.Controllers;

[ApiController]
[Route("api/recipes/{recipeId:guid}/cost")]
[Authorize]
public class CostController(AppDbContext db, ICurrentUserService currentUser, CostCalculationService costService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<CostDto>> GetCost(Guid recipeId)
    {
        var userId = currentUser.UserId;
        var recipe = await db.Recipes
            .Include(r => r.Ingredients)
            .FirstOrDefaultAsync(r => r.Id == recipeId);

        if (recipe == null) return NotFound();
        if (!recipe.IsPublic && recipe.CreatedBy != userId) return Forbid();

        return Ok(costService.Calculate(recipe));
    }
}
