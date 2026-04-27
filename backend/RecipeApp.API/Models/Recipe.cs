using System.ComponentModel.DataAnnotations;

namespace RecipeApp.API.Models;

public class Recipe
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int Servings { get; set; } = 4;

    public int? PrepTimeMinutes { get; set; }

    public int? CookTimeMinutes { get; set; }

    [MaxLength(50)]
    public string? Difficulty { get; set; }

    [MaxLength(100)]
    public string? Category { get; set; }

    [MaxLength(100)]
    public string? Cuisine { get; set; }

    public string[] DietTags { get; set; } = [];

    public Guid CreatedBy { get; set; }

    public bool IsPublic { get; set; } = false;

    public int CurrentVersion { get; set; } = 1;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Ingredient> Ingredients { get; set; } = [];
    public ICollection<RecipeStep> Steps { get; set; } = [];
    public ICollection<RecipeVersion> Versions { get; set; } = [];
    public NutritionalInfo? NutritionalInfo { get; set; }
}
