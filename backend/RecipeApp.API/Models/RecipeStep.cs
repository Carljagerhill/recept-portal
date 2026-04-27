using System.ComponentModel.DataAnnotations;

namespace RecipeApp.API.Models;

public class RecipeStep
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid RecipeId { get; set; }

    public int StepNumber { get; set; }

    [Required]
    public string Instruction { get; set; } = string.Empty;

    public Recipe Recipe { get; set; } = null!;
}
