namespace RecipeApp.API.DTOs;

public record RecipeListItemDto(
    Guid Id,
    string Title,
    string? Description,
    int Servings,
    int? PrepTimeMinutes,
    int? CookTimeMinutes,
    string? Difficulty,
    string? Category,
    string? Cuisine,
    string[] DietTags,
    bool IsPublic,
    int CurrentVersion,
    Guid CreatedBy,
    DateTime CreatedAt
);

public record RecipeDetailDto(
    Guid Id,
    string Title,
    string? Description,
    int Servings,
    int? PrepTimeMinutes,
    int? CookTimeMinutes,
    string? Difficulty,
    string? Category,
    string? Cuisine,
    string[] DietTags,
    bool IsPublic,
    int CurrentVersion,
    Guid CreatedBy,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    List<IngredientDto> Ingredients,
    List<RecipeStepDto> Steps,
    NutritionalInfoDto? NutritionalInfo
);

public record CreateRecipeDto(
    string Title,
    string? Description,
    int Servings,
    int? PrepTimeMinutes,
    int? CookTimeMinutes,
    string? Difficulty,
    string? Category,
    string? Cuisine,
    string[]? DietTags,
    Guid? TeamId,
    bool IsPublic
);

public record UpdateRecipeDto(
    string Title,
    string? Description,
    int Servings,
    int? PrepTimeMinutes,
    int? CookTimeMinutes,
    string? Difficulty,
    string? Category,
    string? Cuisine,
    string[]? DietTags,
    bool IsPublic,
    string? ChangeNote
);

public record IngredientDto(
    Guid Id,
    string Name,
    decimal Quantity,
    string Unit,
    decimal? PricePerUnit,
    int SortOrder
);

public record CreateIngredientDto(
    string Name,
    decimal Quantity,
    string Unit,
    decimal? PricePerUnit,
    int SortOrder
);

public record UpdateIngredientDto(
    string Name,
    decimal Quantity,
    string Unit,
    decimal? PricePerUnit,
    int SortOrder
);

public record RecipeStepDto(Guid Id, int StepNumber, string Instruction);

public record CreateStepDto(int StepNumber, string Instruction);

public record UpdateStepDto(int StepNumber, string Instruction);

public record ScaledRecipeDto(
    Guid RecipeId,
    int OriginalServings,
    int TargetServings,
    decimal ScaleFactor,
    List<ScaledIngredientDto> Ingredients
);

public record ScaledIngredientDto(
    Guid Id,
    string Name,
    decimal OriginalQuantity,
    decimal ScaledQuantity,
    string Unit
);

public record UnitConversionResultDto(
    decimal OriginalValue,
    string FromUnit,
    decimal ConvertedValue,
    string ToUnit
);

public record CostDto(
    Guid RecipeId,
    int Servings,
    decimal TotalCost,
    decimal CostPerServing,
    List<IngredientCostDto> Breakdown
);

public record IngredientCostDto(
    string Name,
    decimal Quantity,
    string Unit,
    decimal? PricePerUnit,
    decimal? TotalCost
);

public record NutritionalInfoDto(
    decimal? CaloriesPerServing,
    decimal? ProteinG,
    decimal? CarbsG,
    decimal? FatG,
    decimal? FiberG
);

public record UpdateNutritionalInfoDto(
    decimal? CaloriesPerServing,
    decimal? ProteinG,
    decimal? CarbsG,
    decimal? FatG,
    decimal? FiberG
);

public record RecipeVersionDto(
    Guid Id,
    int VersionNumber,
    string Title,
    string? Description,
    int Servings,
    string? ChangeNote,
    Guid CreatedBy,
    DateTime CreatedAt,
    object Snapshot
);

public record CreateVersionDto(string? ChangeNote);
