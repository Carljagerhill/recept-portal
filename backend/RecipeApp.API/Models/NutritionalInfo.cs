using System.ComponentModel.DataAnnotations;

namespace RecipeApp.API.Models;

public class NutritionalInfo
{
    [Key]
    public Guid RecipeId { get; set; }

    public decimal? CaloriesPerServing { get; set; }
    public decimal? ProteinG { get; set; }
    public decimal? CarbsG { get; set; }
    public decimal? FatG { get; set; }
    public decimal? FiberG { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Recipe Recipe { get; set; } = null!;
}
