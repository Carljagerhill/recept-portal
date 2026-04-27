using Microsoft.EntityFrameworkCore;
using RecipeApp.API.Models;

namespace RecipeApp.API.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Recipe> Recipes => Set<Recipe>();
    public DbSet<Ingredient> Ingredients => Set<Ingredient>();
    public DbSet<RecipeStep> RecipeSteps => Set<RecipeStep>();
    public DbSet<RecipeVersion> RecipeVersions => Set<RecipeVersion>();
    public DbSet<NutritionalInfo> NutritionalInfos => Set<NutritionalInfo>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Recipe>()
            .Property(r => r.DietTags)
            .HasColumnType("text[]");

        modelBuilder.Entity<RecipeVersion>()
            .Property(v => v.Snapshot)
            .HasColumnType("jsonb");

        modelBuilder.Entity<Recipe>()
            .HasOne(r => r.NutritionalInfo)
            .WithOne(n => n.Recipe)
            .HasForeignKey<NutritionalInfo>(n => n.RecipeId);

        modelBuilder.Entity<Recipe>()
            .HasMany(r => r.Ingredients)
            .WithOne(i => i.Recipe)
            .HasForeignKey(i => i.RecipeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Recipe>()
            .HasMany(r => r.Steps)
            .WithOne(s => s.Recipe)
            .HasForeignKey(s => s.RecipeId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Recipe>()
            .HasMany(r => r.Versions)
            .WithOne(v => v.Recipe)
            .HasForeignKey(v => v.RecipeId)
            .OnDelete(DeleteBehavior.Cascade);

        // Schema uses "nutritional_info" not "nutritional_infos"
        modelBuilder.Entity<NutritionalInfo>().ToTable("nutritional_info");
    }
}
