using System.ComponentModel.DataAnnotations;

namespace RecipeApp.API.Models;

public class Ingredient
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid RecipeId { get; set; }

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    public decimal Quantity { get; set; }

    [Required, MaxLength(20)]
    public string Unit { get; set; } = string.Empty;

    public decimal? PricePerUnit { get; set; }

    public int SortOrder { get; set; } = 0;

    public Recipe Recipe { get; set; } = null!;
}
