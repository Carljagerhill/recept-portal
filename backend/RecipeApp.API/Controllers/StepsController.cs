using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RecipeApp.API.Data;
using RecipeApp.API.DTOs;
using RecipeApp.API.Models;
using RecipeApp.API.Services;

namespace RecipeApp.API.Controllers;

[ApiController]
[Route("api/recipes/{recipeId:guid}/steps")]
[Authorize]
public class StepsController(AppDbContext db, ICurrentUserService currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<RecipeStepDto>>> GetAll(Guid recipeId)
    {
        var recipe = await db.Recipes.FindAsync(recipeId);
        if (recipe == null) return NotFound();
        if (!recipe.IsPublic && recipe.CreatedBy != currentUser.UserId) return Forbid();

        var steps = await db.RecipeSteps
            .Where(s => s.RecipeId == recipeId)
            .OrderBy(s => s.StepNumber)
            .Select(s => new RecipeStepDto(s.Id, s.StepNumber, s.Instruction))
            .ToListAsync();

        return Ok(steps);
    }

    [HttpPost]
    public async Task<ActionResult<RecipeStepDto>> Create(Guid recipeId, [FromBody] CreateStepDto dto)
    {
        var recipe = await db.Recipes.FindAsync(recipeId);
        if (recipe == null) return NotFound();
        if (recipe.CreatedBy != currentUser.UserId) return Forbid();

        var step = new RecipeStep { RecipeId = recipeId, StepNumber = dto.StepNumber, Instruction = dto.Instruction };
        db.RecipeSteps.Add(step);
        recipe.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { recipeId }, new RecipeStepDto(step.Id, step.StepNumber, step.Instruction));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<RecipeStepDto>> Update(Guid recipeId, Guid id, [FromBody] UpdateStepDto dto)
    {
        var recipe = await db.Recipes.FindAsync(recipeId);
        if (recipe == null) return NotFound();
        if (recipe.CreatedBy != currentUser.UserId) return Forbid();

        var step = await db.RecipeSteps.FirstOrDefaultAsync(s => s.Id == id && s.RecipeId == recipeId);
        if (step == null) return NotFound();

        step.StepNumber = dto.StepNumber;
        step.Instruction = dto.Instruction;
        recipe.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return Ok(new RecipeStepDto(step.Id, step.StepNumber, step.Instruction));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid recipeId, Guid id)
    {
        var recipe = await db.Recipes.FindAsync(recipeId);
        if (recipe == null) return NotFound();
        if (recipe.CreatedBy != currentUser.UserId) return Forbid();

        var step = await db.RecipeSteps.FirstOrDefaultAsync(s => s.Id == id && s.RecipeId == recipeId);
        if (step == null) return NotFound();

        db.RecipeSteps.Remove(step);
        recipe.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return NoContent();
    }
}
