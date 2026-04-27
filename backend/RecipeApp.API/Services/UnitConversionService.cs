namespace RecipeApp.API.Services;

public class UnitConversionService
{
    private static readonly Dictionary<string, decimal> WeightToGrams = new(StringComparer.OrdinalIgnoreCase)
    {
        ["g"] = 1m,
        ["kg"] = 1000m,
        ["oz"] = 28.3495m,
        ["lb"] = 453.592m,
    };

    private static readonly Dictionary<string, decimal> VolumeToMl = new(StringComparer.OrdinalIgnoreCase)
    {
        ["ml"] = 1m,
        ["l"] = 1000m,
        ["tsp"] = 4.92892m,
        ["tbsp"] = 14.7868m,
        ["cup"] = 236.588m,
        ["fl_oz"] = 29.5735m,
    };

    public decimal Convert(decimal value, string fromUnit, string toUnit)
    {
        if (fromUnit.Equals(toUnit, StringComparison.OrdinalIgnoreCase))
            return value;

        if (WeightToGrams.TryGetValue(fromUnit, out var fromGrams) && WeightToGrams.TryGetValue(toUnit, out var toGrams))
            return value * fromGrams / toGrams;

        if (VolumeToMl.TryGetValue(fromUnit, out var fromMl) && VolumeToMl.TryGetValue(toUnit, out var toMl))
            return value * fromMl / toMl;

        throw new InvalidOperationException($"Cannot convert between '{fromUnit}' and '{toUnit}': incompatible unit categories.");
    }

    public bool CanConvert(string fromUnit, string toUnit)
    {
        if (fromUnit.Equals(toUnit, StringComparison.OrdinalIgnoreCase)) return true;
        if (WeightToGrams.ContainsKey(fromUnit) && WeightToGrams.ContainsKey(toUnit)) return true;
        if (VolumeToMl.ContainsKey(fromUnit) && VolumeToMl.ContainsKey(toUnit)) return true;
        return false;
    }

    public static IEnumerable<string> AllUnits()
        => ["g", "kg", "oz", "lb", "ml", "l", "tsp", "tbsp", "cup", "fl_oz", "pcs"];
}
