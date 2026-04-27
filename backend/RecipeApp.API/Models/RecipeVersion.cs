using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace RecipeApp.API.Models;

public class RecipeVersion
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid RecipeId { get; set; }

    public int VersionNumber { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    public int Servings { get; set; }

    public string? ChangeNote { get; set; }

    public JsonDocument Snapshot { get; set; } = JsonDocument.Parse("{}");

    public Guid CreatedBy { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Recipe Recipe { get; set; } = null!;
}
